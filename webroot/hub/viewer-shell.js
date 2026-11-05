// Shared controls are mounted outside each simulator's scaled presentation.
(() => {
  const slug = location.pathname.split('/')[1] || 'intellistar-1';
  const players = {
    'intellistar-1': ['IntelliStar 1', 'intellistar-1', 'https://i1.weatherstar.dev'],
    'weatherstar-xl': ['WeatherStar XL', 'weatherstar-xl'],
    'weatherscan-local': ['Weatherscan Local', 'weatherscan-local'],
    'weatherscan-v1': ['Weatherscan v1', 'weatherscan-v1'],
    'weatherscan-v2': ['Weatherscan v2', 'weatherscan-v2'],
  };
  const [name, repository, online] = players[slug] || players['intellistar-1'];
  window.weatherViewer = { slug, name };
  const shell = document.createElement('div');
  shell.id = 'viewer-shell';
  shell.innerHTML = `<a id="player-home" href="/">‹ Players &amp; city</a>
    <section id="audio-permission" aria-label="Weather audio" hidden>
      <p>Enable weather audio?</p>
      <p>Allow music and narration by selecting Enable sound.</p>
      <button id="enable-sound" type="button">Enable sound</button>
      <button id="dismiss-sound" type="button">Continue without sound</button>
    </section>
    <aside id="viewer-toolbar" aria-label="Weather viewer controls" hidden>
      <button
        id="open-viewer-settings"
        type="button"
        aria-label="Settings"
        aria-haspopup="dialog"
        data-label="Settings"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="m9 3-.5 2.2-1.6.9-2.2-.7-3 5.2 1.7 1.5v1.8l-1.7 1.5 3 5.2 2.2-.7 1.6.9L9 23h6l.5-2.2 1.6-.9 2.2.7 3-5.2-1.7-1.5v-1.8l1.7-1.5-3-5.2-2.2.7-1.6-.9L15 3Z"
            transform="translate(1 0) scale(.92)"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        id="open-viewer-about"
        type="button"
        aria-label="About"
        aria-haspopup="dialog"
        data-label="About"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7v.1" />
        </svg>
      </button>
    </aside>

    <dialog
      id="viewer-settings-dialog"
      class="viewer-dialog"
      aria-labelledby="viewer-settings-title"
    >
      <form method="dialog" class="viewer-dialog-header">
        <h2 id="viewer-settings-title">Viewer settings</h2>
        <button type="submit" aria-label="Close settings">Close</button>
      </form>
      <p id="weather-status" role="status" aria-live="polite">Waiting for current weather</p>
      <section class="viewer-settings-section" aria-labelledby="location-settings-title">
        <h3 id="location-settings-title">Location</h3>
        <p id="selected-location">Boone, NC</p>
        <form id="city-search">
          <label for="city-query">Choose a town or city</label>
          <input
            id="city-query"
            type="search"
            placeholder="City, state or country"
            minlength="2"
            maxlength="100"
            required
          />
          <button type="submit">Search</button>
        </form>
        <p id="city-search-status" role="status"></p>
        <ul id="city-results"></ul>
        <button id="reset-city" type="button">Use Boone, NC</button>
      </section>
      <section class="viewer-settings-section" aria-labelledby="sound-settings-title">
        <h3 id="sound-settings-title">Sound</h3>
        <button id="mute-audio" type="button">Enable sound</button>
        <label for="music-volume">Music <output id="music-volume-value">80%</output></label>
        <input id="music-volume" type="range" min="0" max="100" value="80" />
        <label for="narration-volume"
          >Narration <output id="narration-volume-value">100%</output></label
        >
        <input id="narration-volume" type="range" min="0" max="100" value="100" />
      </section>
    </dialog>

    <dialog id="viewer-about-dialog" class="viewer-dialog" aria-labelledby="viewer-about-title">
      <form method="dialog" class="viewer-dialog-header">
        <h2 id="viewer-about-title">About this viewer</h2>
        <button type="submit" aria-label="Close about">Close</button>
      </form>
      <p class="viewer-about-name">High Country Weather</p>
      <p>
        This viewer is based on the original weather simulators by Mist Weather Media. This fork starts with Boone, North Carolina, and adds
        city selection, automatic playback, and weather recovery.
      </p>
      <div class="viewer-about-links">
        <a
          href="https://github.com/MistWeatherMedia/intellistar-1"
          target="_blank"
          rel="noopener noreferrer"
          >Original project on GitHub</a
        >
        <a href="https://i1.weatherstar.dev" target="_blank" rel="noopener noreferrer"
          >Original online simulator</a
        >
        <a
          href="https://github.com/high-country-web/weather"
          target="_blank"
          rel="noopener noreferrer"
          >View this fork on GitHub</a
        >
      </div>
      <p class="viewer-about-credit">
        Original simulator © Mist Weather Media 2025. Licensed under GPL-3.0.
      </p>
    </dialog>
`;
  document.body.append(shell);
  const links = shell.querySelectorAll('.viewer-about-links a');
  links[0].href = `https://github.com/MistWeatherMedia/${repository}`;
  if (online) links[1].href = online;
  else links[1].remove();
})();
