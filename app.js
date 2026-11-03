const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
const production = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
if (production) process.env.NODE_ENV = 'production';
const publicRoot = path.join(__dirname, production ? 'dist/webroot' : 'webroot');
if (production && (!fs.existsSync(path.join(__dirname, 'dist/build-info.json')) || !fs.existsSync(path.join(publicRoot, 'index.html')))) {
  throw new Error('Production assets are missing or incomplete. Run npm run build before npm run start:prod.');
}
const app = express();
// Log paths and status only: query strings, headers, bodies, and error objects
// can contain credentials and must never be written to the terminal.
function serverLog(level, message) {
  for (const value of [process.env.WEATHER_API_KEY, process.env.MAPBOX_PUBLIC_TOKEN]) {
    if (value) {
      message = message.split(value).join('[redacted]');
      message = message.split(encodeURIComponent(value)).join('[redacted]');
    }
  }
  console[level](`${new Date().toISOString()} ${message}`);
}
app.use((req, res, next) => {
  const started = performance.now();
  const pathname = req.path;
  // Asset and radar traffic is high volume; keep it out of terminal logs.
  if (pathname.startsWith('/api/weather/v3/TileServer/') ||
      pathname === '/api/view-events' ||
      (pathname !== '/' && pathname !== '/index.html' && !pathname.startsWith('/api/'))) return next();
  const category = pathname.startsWith('/api/weather') ? 'weather'
    : pathname.startsWith('/api/') ? 'server'
    : 'viewer';
  res.once('finish', () => {
    serverLog(res.statusCode >= 400 ? 'warn' : 'info',
      `[Boone ${category}] ${req.method} ${JSON.stringify(pathname)} HTTP ${res.statusCode} ${Math.round(performance.now() - started)}ms`);
  });
  res.once('close', () => {
    if (!res.writableFinished) serverLog('warn', `[Boone ${category}] Request interrupted: ${JSON.stringify(pathname)}`);
  });
  next();
});
const allowedPaths = new Set([
  '/v3/wx/observations/current', '/v3/wx/forecast/daily/7day',
  '/v3/wx/forecast/hourly/1day', '/v3/wx/forecast/hourly/2day',
  '/v3/wx/globalAirQuality',
  '/v3/aggcommon/v3-wx-conditions-historical-dailysummary-30day;v3-wx-almanac-daily-5day',
  '/v1/geocode/36.2168/-81.6746/observations/current.json',
  '/v3/alerts/headlines', '/v3/alerts/detail',
  '/v3/TileServer/series/productSet/PPAcore', '/v3/TileServer/tile/twcRadarMosaic'
]);
const allowedParams = new Set(['geocode', 'units', 'language', 'format', 'scale', 'startDay', 'startMonth', 'alertId', 'filter', 'ts', 'xyz']);
const slideNames = new Set(['currentConditions', 'nearbyCities', 'localForecast',
  'weekAhead', 'airQuality', 'radarDoppler', 'localDoppler', 'daypartForecast',
  'almanac', 'bulletin', 'outdoorActivity']);
// Only bounded, known fields can reach logs; never log client-supplied text.
app.post('/api/view-events', express.json({limit: '1kb'}), (req, res) => {
  const {viewId, event, slide, position, total} = req.body || {};
  if (typeof viewId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(viewId)) return res.sendStatus(400);
  if (event === 'slide' && slideNames.has(slide) && Number.isInteger(position) &&
      Number.isInteger(total) && position >= 1 && position <= total && total <= 100) {
    serverLog('info', `[Boone slides] View ${viewId}: ${position}/${total} ${slide}`);
  } else if (event === 'radar-disabled' && ['mobile', 'unsupported', 'no-token', 'initialization-failed'].includes(slide)) {
    serverLog('info', `[Boone viewer] View ${viewId}: radar disabled (${slide}); using weather slides`);
  } else if (event === 'cycle') {
    serverLog('info', `[Boone slides] View ${viewId}: cycle complete; refreshing weather`);
  } else return res.sendStatus(400);
  res.sendStatus(204);
});
app.get('/api/config', (req, res) => {
  const token = process.env.MAPBOX_PUBLIC_TOKEN || '';
  const viewId = randomUUID();
  serverLog('info', `[Boone viewer] View ${viewId} started`);
  res.set('Cache-Control', 'no-store').json({
    viewId,
    weatherConfigured: Boolean(process.env.WEATHER_API_KEY),
    mapboxPublicToken: token.startsWith('pk.') ? token : ''
  });
});
app.use('/api/weather', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.sendStatus(405);
  const incoming = new URL(req.url, 'http://localhost');
  const tileRequest = incoming.pathname.startsWith('/v3/TileServer/');
  if (!allowedPaths.has(incoming.pathname)) return res.sendStatus(404);
  for (const key of incoming.searchParams.keys()) {
    if (!allowedParams.has(key)) return res.status(400).json({error: 'Unsupported parameter'});
  }
  const secret = process.env.WEATHER_API_KEY;
  if (!secret) {
    if (!tileRequest) serverLog('warn', '[Boone weather] Request unavailable: WEATHER_API_KEY is missing');
    return res.status(503).json({error: 'Weather service is not configured'});
  }
  const upstream = new URL(incoming.pathname, 'https://api.weather.com');
  upstream.search = incoming.search;
  if (!incoming.pathname.includes('TileServer') && !incoming.pathname.includes('/alerts/detail') && !incoming.pathname.startsWith('/v1/')) {
    upstream.searchParams.set('geocode', '36.2168,-81.6746');
  }
  upstream.searchParams.set('apiKey', secret);
  if (!tileRequest) serverLog('info', `[Boone weather] Upstream request: ${incoming.pathname}`);
  try {
    const response = await fetch(upstream, {signal: AbortSignal.timeout(12000), redirect: 'error'});
    if (!response.ok) {
      if (!tileRequest) serverLog('warn', `[Boone weather] Upstream HTTP ${response.status}: ${incoming.pathname}`);
      return res.status(502).json({error: 'Weather service unavailable'});
    }
    if (response.status === 204) return res.sendStatus(204);
    const data = Buffer.from(await response.arrayBuffer());
    // Never forward upstream diagnostics, headers, URLs, or echoed credentials.
    if (data.includes(Buffer.from(secret))) {
      serverLog('warn', '[Boone weather] Blocked an upstream response containing a private credential');
      return res.status(502).json({error: 'Invalid weather response'});
    }
    res.type(incoming.pathname.includes('/tile/') ? 'image/png' : 'application/json').send(data);
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'timed out' : 'connection or response failed';
    if (!tileRequest) serverLog('warn', `[Boone weather] Upstream ${reason}: ${incoming.pathname}`);
    res.status(502).json({error: 'Weather service unavailable'});
  }
});
app.use(express.static(publicRoot, {dotfiles: 'deny'}));
if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  serverLog('info', `[Boone server] Starting on port ${port} (${production ? 'production' : 'development'})`);
  serverLog('info', `[Boone server] Serving ${production ? 'dist/webroot (minified build)' : 'webroot'}`);
  serverLog('info', `[Boone server] Weather API: ${process.env.WEATHER_API_KEY ? 'configured' : 'missing'}`);
  const token = process.env.MAPBOX_PUBLIC_TOKEN || '';
  serverLog('info', `[Boone server] Public Mapbox token: ${token.startsWith('pk.') ? 'configured' : token ? 'invalid; radar disabled' : 'missing; radar disabled'}`);
  app.listen(port, '0.0.0.0', () => serverLog('info', `[Boone server] Ready at http://localhost:${port}; request logging enabled`));
}
module.exports = app;
