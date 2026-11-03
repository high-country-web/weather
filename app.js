const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
const app = express();
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
app.get('/api/config', (req, res) => {
  const token = process.env.MAPBOX_PUBLIC_TOKEN || '';
  res.set('Cache-Control', 'no-store').json({
    weatherConfigured: Boolean(process.env.WEATHER_API_KEY),
    mapboxPublicToken: token.startsWith('pk.') ? token : ''
  });
});
app.use('/api/weather', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.sendStatus(405);
  const incoming = new URL(req.url, 'http://localhost');
  if (!allowedPaths.has(incoming.pathname)) return res.sendStatus(404);
  for (const key of incoming.searchParams.keys()) {
    if (!allowedParams.has(key)) return res.status(400).json({error: 'Unsupported parameter'});
  }
  const secret = process.env.WEATHER_API_KEY;
  if (!secret) return res.status(503).json({error: 'Weather service is not configured'});
  const upstream = new URL(incoming.pathname, 'https://api.weather.com');
  upstream.search = incoming.search;
  if (!incoming.pathname.includes('TileServer') && !incoming.pathname.includes('/alerts/detail') && !incoming.pathname.startsWith('/v1/')) {
    upstream.searchParams.set('geocode', '36.2168,-81.6746');
  }
  upstream.searchParams.set('apiKey', secret);
  try {
    const response = await fetch(upstream, {signal: AbortSignal.timeout(12000), redirect: 'error'});
    if (!response.ok) return res.status(502).json({error: 'Weather service unavailable'});
    if (response.status === 204) return res.sendStatus(204);
    const data = Buffer.from(await response.arrayBuffer());
    // Never forward upstream diagnostics, headers, URLs, or echoed credentials.
    if (data.includes(Buffer.from(secret))) return res.status(502).json({error: 'Invalid weather response'});
    res.type(incoming.pathname.includes('/tile/') ? 'image/png' : 'application/json').send(data);
  } catch (_) {
    res.status(502).json({error: 'Weather service unavailable'});
  }
});
app.use(express.static(path.join(__dirname, 'webroot'), {dotfiles: 'deny'}));
if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, '0.0.0.0', () => console.log(`Boone weather: http://localhost:${port}`));
}
module.exports = app;
