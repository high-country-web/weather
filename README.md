# High Country Weather

High Country Weather brings together **the original simulator work of [Mist Weather Media](https://github.com/MistWeatherMedia)** in one place. The players, their visual designs, animations, and original simulator implementations were created by Mist Weather Media and its contributors. This project builds on their work with a shared player-selection home page, individual player URLs, and local-weather customizations defaulting to Boone, North Carolina.

## Original simulators

All five players originate from the Mist Weather Media organization:

| Player | Local path | Original source |
| --- | --- | --- |
| IntelliStar 1 | `/intellistar-1` | [MistWeatherMedia/intellistar-1](https://github.com/MistWeatherMedia/intellistar-1) |
| WeatherSTAR XL | `/weatherstar-xl` | [MistWeatherMedia/weatherstar-xl](https://github.com/MistWeatherMedia/weatherstar-xl) |
| Weatherscan Local | `/weatherscan-local` | [MistWeatherMedia/weatherscan-local](https://github.com/MistWeatherMedia/weatherscan-local) |
| Weatherscan v1 | `/weatherscan-v1` | [MistWeatherMedia/weatherscan-v1](https://github.com/MistWeatherMedia/weatherscan-v1) |
| Weatherscan v2 | `/weatherscan-v2` | [MistWeatherMedia/weatherscan-v2](https://github.com/MistWeatherMedia/weatherscan-v2) |

The root URL (`/`) opens the player gallery. The original IntelliStar viewer lives at `/intellistar-1`; its existing settings and sound controls remain available. The additional players retain their original graphics and run local forecast lineups through the shared Express weather service. Their optional radar, traffic, regional packages, music, and narration are not enabled by the shared adapter yet. Choose a city from the home page to use it across players. Imported player directories include their upstream revision and license in `UPSTREAM.md` and `LICENSE`.

This collection does not claim authorship of the original simulators and is not affiliated with The Weather Channel.

## What changed in this fork

- A shared High Country Weather gallery brings together the five Mist Weather Media players, with screenshot previews and a dedicated URL for each. City selection is shared across players on the same device.
- Boone, NC is the default. Viewers can search for another town/city, save their choice in their own browser, or return to Boone with one button. IP location detection is removed.
- Slides start automatically with an animated **Loading Boone weather…** screen instead of the settings screen.
- Slides loop without reloading the page. Weather requests finish before startup and refresh in the background at the end of each cycle. Failed requests reuse available data and retry automatically.
- Regional current/forecast map slides are omitted to keep the forecast focused on the selected city. Radar slides are optional and remain hidden during preloading until their slide begins.
- Weather and radar data requests go through Express. Private credentials stay on the server.
- Failed optional fonts and images produce warnings and allow startup to continue with available assets and fallback fonts.
- A production build minifies JavaScript and CSS while preserving shared browser globals and license notices.

See [changelog.txt](changelog.txt) for the fork changes and original release history.

## Viewer controls

Small gear (**Settings**) and info (**About**) icons sit in the bottom-right corner. They fade away after three seconds of inactivity and reappear when you move the pointer, tap, or use the keyboard. City selection, weather freshness, and sound controls stay hidden until you open Settings. About credits the original IntelliStar Simulator by Mist Weather Media and links to the upstream project and [this fork on GitHub](https://github.com/high-country-web/weather). A successful complete refresh updates the displayed time; offline status, incomplete updates, and old observations are marked. Weather data is retained in memory for the current visit, so reopening offline still requires a connection before fresh weather is available. Alerts are not replayed from the weather cache.

Open **Settings** to search by town/city, state, or country. Picking a result restarts the viewer with weather and radar centered on that place; normal slide cycles never reload. **Use Boone, NC** restores the default. City search uses the existing private Weather.com key; available locations and weather products depend on the provider's coverage and your key's access.

The **Sound** section in Settings has separate music and narration volume sliders and a mute button. Choices are saved locally when browser storage is available. Returning viewers who previously enabled sound get an automatic playback attempt; if the browser blocks it, **Enable sound** requests a click/tap again. Choosing **Continue without sound** is remembered. Music lowers during narration and returns to the chosen level afterward.

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

The weather proxy allows specific upstream paths and parameters, validates selected coordinates (defaulting to Boone), times out stalled requests, and returns generic errors without upstream credentials or diagnostics.

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

### Update and start with one command

From the deployment checkout on `main`, run `npm run deploy:prod` (or `node scripts/production.js`). The script runs `git pull --ff-only origin main`, `npm install --include=dev`, `npm run build`, and `npm run start:prod`, in that order. It stops on a failed step and leaves Express running in the foreground. Stop an existing server before using this command to avoid a port conflict. Development dependencies are included because the build needs esbuild. The update uses a fast-forward pull and will stop if Git cannot update without merging.

## Logs and troubleshooting

The terminal running Express shows timestamped messages automatically:

- `[Boone server]`: startup mode, asset directory, and whether configuration is present.
- `[Boone viewer]`: page requests and the start of each browser view, identified by a random view ID.
- `[Boone slides]`: slide names/positions and cycle refreshes reported by each browser view.
- `[Boone weather]`: weather requests, upstream HTTP failures, timeouts, and response timing.

Routine asset/image requests and radar TileServer traffic are omitted from terminal logs. Slide reports are best effort and do not block playback.

Server logs exclude query strings, headers, response bodies, raw upstream errors, and credential values. Browser console diagnostics supplement these logs with startup stages, font/image loading, and slide-cycle messages.

- **Missing weather configuration:** set `WEATHER_API_KEY` in the private `.env` or hosting environment, then restart Express.
- **Production assets missing:** run `npm run build` before starting in production mode.
- **Weather unavailable:** check the Express terminal for the upstream status or timeout; available weather stays on screen while requests retry after 15 seconds, then 30 seconds, up to a maximum two-minute delay. Reconnecting also triggers a refresh.
- **Font warnings:** a successful HTTP response means Express served the file; the browser may still reject its font data. Startup continues with fallback fonts.
- **Mobile startup:** phones/tablets skip the desktop radar stack, which allocates eight WebGL maps. Weather slides continue; the Express console records `radar disabled (mobile)`. Browsers without supported WebGL also skip radar, and map initialization errors fall back to weather slides. This reduces a likely source of graphics-memory crashes; physical-device validation is still needed.
- **Sound:** playback starts automatically when the browser permits it, including on iPad/iPhone. Only an actual blocked playback attempt reveals the small **Enable sound** button. Music and narration reuse two persistent audio elements across tracks and slides. Blocked playback is not retried automatically; tap the button to resume. A reload or Safari interruption may require another tap.

## Code formatting

Run `npm run format` to format application JavaScript, the build script, HTML, and application styles. `npm run format:check` checks formatting without modifying files. Both commands use the shared Prettier configuration and leave bundled vendor libraries and generated production assets alone. Startup-screen styles live in `webroot/css/startup.css`.

## Code formatting

Run `npm run format` to format the application source, or `npm run format:check` to check it without changing files. The shared Prettier configuration uses two-space indentation, single quotes in JavaScript, and consistent line wrapping. Vendor libraries and generated production files are excluded.

## Original project and credits

The original simulator was created by **Mist Weather Media**. Its upstream online version is [i1.weatherstar.dev](https://i1.weatherstar.dev); this fork's Boone-specific behavior is described above.

© Mist Weather Media 2025.

Special thanks to **JensonWX** (Lead Developer), **Miceoroni** (Advanced Settings), **zachNet** (original README), and the rest of the Mist Creative Team.

Upstream community: [Mist Weather Media on Discord](https://discord.gg/hV2w5sZQxz). See [LICENSE](LICENSE) for the project's license.
