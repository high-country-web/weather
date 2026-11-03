# Boone IntelliSTAR

This fork automatically displays Boone, North Carolina weather and refreshes weather at each slide cycle without reloading the page.

Requires Node.js 22 or newer. Run `npm install`, fill in the private `.env` file (or copy `example.env` to `.env`), then run `npm start` and open http://localhost:8080.

`WEATHER_API_KEY` is private and used only by Express. The old embedded credential has been removed; obtain your own key and rotate any previously exposed credential. Never add `.env` to Git. `example.env` contains placeholders only.

`MAPBOX_PUBLIC_TOKEN` accepts only a public `pk.*` browser token. It is intentionally returned to the browser; restrict it to your application's URLs in Mapbox. Without it, radar slides are omitted. Private Mapbox tokens are never returned. Weather and radar data requests pass through Express, which allows specific upstream paths, fixes weather coordinates to Boone, times out failed requests, and returns generic errors.

Open the app through Express; static-only development servers cannot provide the private weather proxy. The startup screen explains missing configuration. Weather failures use the existing unavailable-data displays and the next cycle retries. Browser autoplay rules may require a user interaction for sound.

## Original project documentation

# IntelliStar Simulator 

**IntelliStar Simulator** is a simulated recreation of "Local On The 8s" by The Weather Channel in HTML/CSS/JS, as seen from 2007 to 2008, by ***mist weather media***

Online version: [i1.weatherstar.dev](https://i1.weatherstar.dev)

© Mist Weather Media 2025.

------------

**Special thanks to these talented minds who made this project possible!**

**JensonWX** - Lead Developer  
**Miceoroni** - Developer (Advanced Settings)   
**zachNet** - README

and the rest of the Mist Creative Team for their support!

------------

Need support beyond the scope of this README? Have any questions? Feel free to join our Discord for support!

[***mist weather media*** on Discord](https://discord.gg/hV2w5sZQxz)

------------

Are you a developer? Pull requests are welcome! If you find a bug and fix it yourself, submit one with the fixed code and it may be merged into the main branch!

# Initial Setup

Use the Boone setup instructions at the top of this document. Credentials belong in the private `.env`, and `npm start` runs the required Express server.

------------

You're all set. Enjoy!

Many thanks for using our simulator! We hope you like it.

## Browser console diagnostics

Open the browser console to follow `[Boone startup]`, `[Boone assets]`, `[Boone weather]`, and `[Boone slides]` messages. Font and image failures are warnings; startup continues using available assets and fallback fonts. Weather request logs include the endpoint path, HTTP status, and duration, without query strings, credentials, or response bodies.
