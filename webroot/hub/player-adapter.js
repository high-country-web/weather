// The original players own their slide rendering; this adapter owns startup,
// shared preferences and the server connection.
(() => {
  const { city, settle } = weatherHub;
  const slug = location.pathname.split('/')[1];
  const loading = document.createElement('div');
  loading.id = 'hub-loading';
  loading.innerHTML = '<div class="spinner"></div><p></p><small>High Country Weather</small>';
  loading.querySelector('p').textContent = `Loading ${city.displayname} weather…`;
  document.body.append(loading);
  const soundSettings =
    typeof systemSettings === 'undefined' ? audioSettings : systemSettings.audioSettings;
  soundSettings.enableMusic = true;
  soundSettings.narrations = true;
  const localCity = { ...city, extraname: `${city.displayname} Area` };
  let viewId;
  function report(event, slide, position, total) {
    if (!viewId) return;
    fetch('/api/view-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewId, event, slide, position, total, player: slug }),
    }).catch(() => {});
  }
  function ready() {
    loading.remove();
    $('#startup').hide();
    $('#main').show();
    document.getElementById('viewer-toolbar').hidden = false;
    document.getElementById('weather-status').textContent =
      'Weather requests finished at ' + new Date().toLocaleTimeString();
    audioPlayer.initializeAudio();
  }
  function coreSlides(group) {
    const keep = new Set([
      'upNext',
      'cityIntro',
      'bulletin',
      'currentConditions',
      'localForecast',
      'extendedForecast',
      'dayPart',
      'dayDesc',
      'almanac',
    ]);
    group.slides = group.slides.filter((slide) => keep.has(slide.function));
  }
  if (slug === 'weatherstar-xl' || slug === 'weatherscan-local') {
    locationJS = () => {
      locationConfig.mainCity = { ...localCity };
      locationConfig.eightCities.cities = [];
      if (locationConfig.extraCity) locationConfig.extraCity = { ...localCity };
    };
    locationJS();
    // Maps are optional; these imported lineups focus on local weather slides.
    createMaps = () => {};
    initializeRadar = () => {};
    if (slug === 'weatherstar-xl') {
      appearanceSettings.skipSetup = false;
      appearanceSettings.marqueeAd = [
        'High Country Weather • Choose your city and player at weather.highcountryweb.dev',
      ];
      slideSettings.order = slideSettings.order.filter(
        (s) => !['dopplerRadar', 'nearbyCities'].includes(s.function),
      );
      startProgram = async () => {
        grabData();
        await settle();
        ready();
        $('.date-time').show();
        slideKickOff();
      };
    } else {
      apperanceSettings.skipSettings = false;
      apperanceSettings.adMessage = ['High Country Weather'];
      slideTitles = { forecast: 'Your Local Forecast' };
      coreSlides(forecastPackage);
      slideSettings.order[0].slideLineup = [forecastPackage];
      allData = () => grabData();
      dataJS = async () => {
        allData();
        await settle();
        ready();
        slideKickOff();
      };
    }
  } else {
    const settings = systemSettings;
    const main = settings.mainCity;
    Object.assign(main, {
      autoFind: false,
      locationName: city.displayname,
      obsName: city.displayname,
      bulletinName: `${city.displayname} Area`,
      almanacLocationName: city.displayname,
      lat: city.lat,
      lon: city.lon,
      header: `geocode=${city.lat},${city.lon}`,
      timeZone: city.timeZone || 'America/New_York',
    });
    delete main.locationID;
    settings.systemLocation = city.displayname;
    settings.packageSettings = ['forecast'];
    settings.appearanceSettings.adMessage = ['High Country Weather'];
    settings.audioSettings.enableMusic = true;
    settings.audioSettings.narrations = true;
    settings.nearbyCities = { autoFind: false, cities: [] };
    settings.extraCity = { ...settings.extraCity, autoFind: false, cities: [] };
    if (settings.upperDisplayCity)
      Object.assign(settings.upperDisplayCity, main, { enabled: true });
    if (settings.LBar) {
      settings.LBar.locations = {
        autoFind: false,
        maxCities: 1,
        type: 'static',
        cities: [{ ...main }],
      };
      settings.LBar.ccTicker = { autoFind: false, airports: [], cities: [], travelCities: [] };
      lBarData.radarUnavailable = true;
      startMiniRadar = async () => {};
    }
    locationJS = async () => {};
    coreSlides(forecastPackage);
    if (typeof manageDurations === 'function') {
      const originalManageDurations = manageDurations;
      manageDurations = function () {
        originalManageDurations();
        for (const order of slideSettings.order)
          for (const group of order.slideLineup) coreSlides(group);
      };
    }
    // Preserve the original forecast framing and slide durations. Optional
    // regional, traffic and radar packages aren't initialized for local playback.
    startPrograms = async () => {
      await settle();
      ready();
      slideKickOff();
    };
  }
  async function refresh() {
    report('cycle');
    if (slug === 'weatherstar-xl') grabData();
    else await allData();
    await settle();
    document.getElementById('weather-status').textContent =
      'Weather requests finished at ' + new Date().toLocaleTimeString();
  }
  // Record each slide and refresh on a wrap without navigating the document.
  const originalShowSlides = showSlides;
  let previousPosition = -1;
  showSlides = function () {
    let order =
      slug === 'weatherstar-xl'
        ? slideSettings.order
        : slideSettings.order[typeof orderidx === 'undefined' ? 0 : orderidx].slideLineup;
    const wraps =
      slug === 'weatherstar-xl'
        ? idx >= order.length
        : gidx === order.length - 1 && idx >= order[gidx].slides.length;
    if (wraps && slug === 'weatherstar-xl') {
      idx = 0;
      nidx = 1;
    }
    if (wraps)
      refresh().catch(() =>
        console.warn('[Weather] Cycle refresh incomplete; retrying next cycle.'),
      );
    originalShowSlides();
    order =
      slug === 'weatherstar-xl'
        ? slideSettings.order
        : slideSettings.order[typeof orderidx === 'undefined' ? 0 : orderidx].slideLineup;
    const slides = slug === 'weatherstar-xl' ? order : order.flatMap((g) => g.slides);
    const position =
      slug === 'weatherstar-xl'
        ? idx
        : order.slice(0, gidx).reduce((n, g) => n + g.slides.length, 0) + idx;
    if (position !== previousPosition) {
      previousPosition = position;
      report('slide', slides[position]?.function, position + 1, slides.length);
    }
  };
  async function start() {
    try {
      const config = await fetch('/api/config').then((response) => response.json());
      viewId = config.viewId;
      if (!config.weatherConfigured) throw new Error('Weather service is not configured.');
      if (slug.includes('-v')) {
        await startSystem();
        await settle();
      } else if (slug === 'weatherstar-xl') startButton();
      else {
        locationJS();
        await dataJS();
      }
    } catch {
      loading.querySelector('p').textContent = 'Weather is temporarily unavailable';
      loading.querySelector('small').textContent =
        'Retrying in 30 seconds. You can also choose another player.';
      setTimeout(start, 30000);
    }
  }
  document.addEventListener('DOMContentLoaded', start);
})();
