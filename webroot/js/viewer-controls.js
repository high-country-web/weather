function validViewerCity(city) {
  return (
    city &&
    typeof city.displayname === 'string' &&
    city.displayname.length > 0 &&
    city.displayname.length <= 100 &&
    Number.isFinite(Number(city.lat)) &&
    Math.abs(Number(city.lat)) <= 90 &&
    Number.isFinite(Number(city.lon)) &&
    Math.abs(Number(city.lon)) <= 180
  );
}

const audioVolumeInputs = [
  ['music', 'music-volume'],
  ['narration', 'narration-volume'],
];

function updateAudioControls() {
  const button = document.getElementById('mute-audio');
  if (!button) return;
  if (!audioPlayer.soundEnabled) {
    button.textContent = 'Enable sound';
  } else {
    button.textContent = audioPlayer.preferences.muted ? 'Unmute' : 'Mute all';
  }
  button.setAttribute(
    'aria-pressed',
    String(audioPlayer.preferences.muted || !audioPlayer.soundEnabled),
  );
  for (const [type, id] of audioVolumeInputs) {
    document.getElementById(id).value = audioPlayer.preferences[type];
    document.getElementById(`${id}-value`).textContent = `${audioPlayer.preferences[type]}%`;
  }
}

function selectWeatherCity(city) {
  if (!validViewerCity(city)) return;
  let saved = false;
  try {
    localStorage.setItem('weather-city', JSON.stringify(city));
    saved = true;
  } catch (_) {}
  const url = new URL(location.href);
  for (const key of ['city', 'lat', 'lon', 'state']) url.searchParams.delete(key);
  // URL fallback also lets selection work with browser storage disabled.
  if (!saved) {
    url.searchParams.set('city', city.displayname);
    url.searchParams.set('lat', city.lat);
    url.searchParams.set('lon', city.lon);
    url.searchParams.set('state', city.state || '');
  }
  // A deliberate city change restarts maps and narration together. Slide cycles never reload.
  location.assign(url.href);
}

function initializeAudioControls() {
  updateAudioControls();
  document
    .getElementById('enable-sound')
    .addEventListener('click', () => audioPlayer.enableSound());
  document
    .getElementById('dismiss-sound')
    .addEventListener('click', () => audioPlayer.continueSilently());
  document.getElementById('mute-audio').addEventListener('click', () => {
    if (!audioPlayer.soundEnabled) audioPlayer.enableSound();
    else {
      audioPlayer.preferences.muted = !audioPlayer.preferences.muted;
      audioPlayer.savePreferences();
    }
  });
  for (const [type, id] of audioVolumeInputs) {
    document.getElementById(id).addEventListener('input', (event) => {
      audioPlayer.preferences[type] = Number(event.target.value);
      audioPlayer.savePreferences();
    });
  }
}

function renderCitySearchResults(locations, results) {
  let count = 0;
  const limit = Math.min(locations?.latitude?.length || 0, 10);

  for (let i = 0; i < limit; i++) {
    const city = {
      displayname: locations.city?.[i] || locations.displayName?.[i],
      lat: locations.latitude[i],
      lon: locations.longitude?.[i],
      state: locations.adminDistrictCode?.[i] || '',
      stateFull: locations.adminDistrict?.[i] || '',
    };
    if (!validViewerCity(city)) continue;

    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = [city.displayname, city.stateFull || city.state, locations.country?.[i]]
      .filter(Boolean)
      .join(', ');
    button.addEventListener('click', () => selectWeatherCity(city));
    item.append(button);
    results.append(item);
    count++;
  }

  return count;
}

async function fetchCitySearchResults(query, signal) {
  const params = new URLSearchParams({
    query,
    language: 'en-US',
    format: 'json',
    locationType: 'city',
  });
  const response = await fetch(`/api/weather/v3/location/search?${params}`, { signal });
  if (!response.ok) throw new Error('Search unavailable');

  const data = await response.json();
  return data.location;
}

function initializeCitySearch() {
  document
    .getElementById('reset-city')
    .addEventListener('click', () =>
      selectWeatherCity(window.weatherHub?.boone || defaultWeatherCity),
    );
  let searchController;
  document.getElementById('city-search').addEventListener('submit', async (event) => {
    event.preventDefault();
    searchController?.abort();
    const controller = new AbortController();
    searchController = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    const status = document.getElementById('city-search-status');
    const results = document.getElementById('city-results');
    results.replaceChildren();
    status.textContent = 'Searching…';
    try {
      const query = document.getElementById('city-query').value.trim();
      const locations = await fetchCitySearchResults(query, controller.signal);
      const count = renderCitySearchResults(locations, results);
      status.textContent = count
        ? 'Select a place to show its weather.'
        : 'No places found. Try a city and state or country.';
    } catch (_) {
      if (searchController === controller)
        status.textContent = 'City search is unavailable. Please try again.';
    } finally {
      clearTimeout(timeout);
    }
  });
}

function initializeViewerDialogs() {
  const dialogs = [
    ['open-viewer-settings', 'viewer-settings-dialog'],
    ['open-viewer-about', 'viewer-about-dialog'],
  ];

  for (const [buttonId, dialogId] of dialogs) {
    const dialog = document.getElementById(dialogId);
    document.getElementById(buttonId).addEventListener('click', () => dialog.showModal());
  }
}

function initializeViewerToolbar() {
  const toolbar = document.getElementById('viewer-toolbar');
  let hideTimer;

  const revealToolbar = () => {
    toolbar.classList.remove('viewer-toolbar-idle');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toolbar.classList.add('viewer-toolbar-idle'), 3000);
  };

  for (const event of ['pointermove', 'pointerdown', 'keydown']) {
    document.addEventListener(event, revealToolbar, { passive: true });
  }
  revealToolbar();
}

document.addEventListener('DOMContentLoaded', () => {
  const city = window.weatherHub?.city || locationConfig.mainCity;
  document.getElementById('selected-location').textContent = [city.displayname, city.state]
    .filter(Boolean)
    .join(', ');
  document.title = `${city.displayname} Weather · ${window.weatherViewer?.name || 'IntelliStar 1'}`;

  initializeAudioControls();
  initializeCitySearch();
  initializeViewerDialogs();
  initializeViewerToolbar();
});
