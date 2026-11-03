# Project requirements

- Show weather for Boone, North Carolina only.
- Start slides automatically without showing the settings screen.
- Show an animated “Loading Boone weather…” screen during startup.
- Loop slides continuously without reloading the page, refreshing weather each cycle.
- Keep a private, ignored .env and a committed example.env containing placeholders.
- Keep private API keys on the Express server and route browser weather requests through it. Handle Mapbox’s public browser token separately.
- Never commit secrets or return private keys to the browser.
- Preserve unrelated existing changes.
- Log startup stages, asset loading outcomes, weather request status/timing, and slide cycles in the browser console without printing credentials or token-bearing URLs.
- Treat failed optional fonts and images as warnings so they cannot block automatic startup.
