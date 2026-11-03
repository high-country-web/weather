# Boone IntelliSTAR

A Boone, North Carolina customization of [Mist Weather Media's IntelliStar Simulator](https://github.com/MistWeatherMedia/intellistar-1), a recreation of The Weather Channel's Local on the 8s in HTML, CSS, and JavaScript.

## What changed in this fork

- Weather is fixed to Boone, NC; IP location detection and nearby-city discovery are removed.
- Slides start automatically with an animated **Loading Boone weather…** screen instead of the settings screen.
- Slides loop without reloading the page. Weather requests finish before startup and refresh at the end of each cycle.
- Regional current/forecast map slides are omitted to keep the forecast focused on Boone. Radar slides are optional.
- Weather and radar data requests go through Express. Private credentials stay on the server.
- Failed optional fonts and images produce warnings and allow startup to continue with available assets and fallback fonts.
- Express logs startup, page and asset requests, HTTP status/timing, and upstream weather failures.
- A production build minifies JavaScript and CSS while preserving shared browser globals and license notices.

See [changelog.txt](changelog.txt) for the fork changes and original release history.

## Requirements and setup

Use Node.js 22 or newer and npm. The app must run through Express; a static-only host cannot provide the weather proxy.

1. Run `npm ci` to install dependencies.
2. Copy `example.env` to `.env` if a private `.env` does not already exist.
3. Fill in the values below, then run `npm start`.
4. Open [localhost:8080](http://localhost:8080), or use the port configured on your host.

| Variable | Purpose |
| --- | --- |
| `WEATHER_API_KEY` | Required private Weather.com API key; used only by Express. |
| `MAPBOX_PUBLIC_TOKEN` | Optional public `pk.*` Mapbox browser token; enables radar maps. |
| `PORT` | Express listening port; defaults to `8080`. |
| `NODE_ENV` | Set to `production` to make `npm start` serve the generated production build. |

On a hosting service, set these variables in its environment settings. The ignored `.env` is not uploaded through Git. Restart Express after changing configuration.

### Credentials

Never commit `.env`, put private keys in `webroot`, or include them in public build artifacts. `example.env` contains placeholders only. The old embedded weather credential and unused traffic-key placeholder have been removed. A traffic API key is not needed by the current slides; use your own weather key and rotate any credential previously exposed in source.

The Mapbox token is intentionally delivered to the browser. Use a public `pk.*` token with allowed-URL restrictions; private tokens are not returned. If the public token is absent or invalid, radar slides are skipped.

The weather proxy allows specific upstream paths and parameters, fixes forecast coordinates to Boone, times out stalled requests, and returns generic errors without upstream credentials or diagnostics.

## Production build

Install build dependencies and generate the production assets:

```sh
npm ci --include=dev
npm run build
npm run start:prod
```

The build recreates `dist/webroot`, minifies JavaScript and CSS, and copies images, fonts, audio, and other assets. It excludes dotfiles and development source maps. Editable source remains in `webroot`; generated `dist` files are ignored by Git.

`npm run start:prod` serves the build through Express. `npm start` also serves it when `NODE_ENV=production`; otherwise it serves the source assets. Production startup refuses to serve a missing or incomplete build. Rebuild and restart after source changes.

For deployment, keep `app.js`, `package.json`, the installed production dependencies, and the complete generated `dist` directory, including `build-info.json`. Supply credentials separately at runtime. You may run `npm prune --omit=dev` after building; the build step itself needs development dependencies. HTML, images, fonts, audio, and the Express server are not minified by this build.

## Logs and troubleshooting

The terminal running Express shows timestamped messages automatically:

- `[Boone server]`: startup mode, asset directory, and whether configuration is present.
- `[Boone page]` and `[Boone assets]`: requested paths, HTTP status, and elapsed time.
- `[Boone weather]`: weather requests, upstream HTTP failures, timeouts, and response timing.

Server logs exclude query strings, headers, response bodies, raw upstream errors, and credential values. Browser console diagnostics supplement these logs with startup stages, font/image loading, and slide-cycle messages.

- **Missing weather configuration:** set `WEATHER_API_KEY` in the private `.env` or hosting environment, then restart Express.
- **Production assets missing:** run `npm run build` before starting in production mode.
- **Weather unavailable:** check the Express terminal for the upstream status or timeout; the next slide cycle retries weather requests.
- **Font warnings:** a successful HTTP response means Express served the file; the browser may still reject its font data. Startup continues with fallback fonts.
- **No sound:** browser autoplay rules may require a user interaction before audio can play.

## Original project and credits

The original simulator was created by **Mist Weather Media**. Its upstream online version is [i1.weatherstar.dev](https://i1.weatherstar.dev); this fork's Boone-specific behavior is described above.

© Mist Weather Media 2025.

Special thanks to **JensonWX** (Lead Developer), **Miceoroni** (Advanced Settings), **zachNet** (original README), and the rest of the Mist Creative Team.

Upstream community: [Mist Weather Media on Discord](https://discord.gg/hV2w5sZQxz). See [LICENSE](LICENSE) for the project's license.
