# Project requirements

- Default to Boone, North Carolina. Allow viewers to select another town/city and remember their own choice.
- Start slides automatically without showing the settings screen.
- Show an animated “Loading Boone weather…” screen during startup, using the selected city name when changed.
- Loop slides continuously without reloading the page, refreshing weather each cycle.
- Keep a private, ignored .env and a committed example.env containing placeholders.
- Keep private API keys on the Express server and route browser weather requests through it. Handle Mapbox’s public browser token separately.
- Never commit secrets or return private keys to the browser.
- Preserve unrelated existing changes.
- Keep the Express console focused on server startup, viewer starts, slide changes/cycle refreshes, and weather/server diagnostics. Suppress routine asset/image requests and radar TileServer traffic. Never print credentials, query strings, headers, response bodies, or token-bearing URLs. Browser diagnostics may supplement these server logs.
- Treat failed optional fonts and images as warnings so they cannot block automatic startup.
- Provide a production build that minifies JavaScript and CSS, preserves shared browser globals, and serves through Express without including private configuration in public artifacts.
- Keep radar maps hidden during startup/preloading; reveal them only when a radar slide begins.
- Keep the fork changelog focused on major features relative to upstream; omit intermediate fixes, logging tweaks, and development-process details.
- Use the shared Prettier configuration for application code. Keep bundled vendor libraries and generated assets out of formatting changes.
- Reuse persistent music/narration audio elements. Honor existing browser playback permission on all devices; show the sound button only after an actual NotAllowedError. Never force a sound prompt based on device type or repeatedly retry blocked autoplay.
- Keep the production update command sequential: fast-forward pull from origin/main, install build dependencies, build, then start production; stop on failures.
- All five player pages must share the IntelliStar-style Settings/About buttons, city selection, saved sound preferences, volume sliders, and mute controls. Enable each player's music and narration through persistent shared audio channels while retaining its own recordings and artwork.
