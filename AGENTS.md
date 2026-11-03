# Project requirements

- Show weather for Boone, North Carolina only.
- Start slides automatically without showing the settings screen.
- Show an animated “Loading Boone weather…” screen during startup.
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
