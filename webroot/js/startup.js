// Avoid allocating the eight-map desktop radar stack on phones/tablets.
function radarUnavailableReason() {
  const mobile =
    navigator.userAgentData?.mobile ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    (window.matchMedia('(pointer: coarse)').matches &&
      Math.min(screen.width, screen.height) <= 1024);
  if (mobile) return 'mobile';
  try {
    if (typeof mapboxgl === 'undefined' || !mapboxgl.supported()) return 'unsupported';
  } catch (_) {
    return 'unsupported';
  }
  return null;
}

function skipRadar(reason) {
  slideSettings.order = slideSettings.order.filter(
    (s) => !['radarDoppler', 'localDoppler'].includes(s.function),
  );
  console.warn(`[Boone startup] Radar disabled (${reason}); continuing weather slides`);
  if (window.reportBooneSlide) window.reportBooneSlide('radar-disabled', reason);
}

document.addEventListener('DOMContentLoaded', async () => {
  console.info('[Boone startup] Starting');
  let stage = 'configuration';
  $.ajaxSetup({ timeout: 15000 });
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Configuration unavailable');
    const config = await response.json();
    if (!config.weatherConfigured)
      throw new Error('Add WEATHER_API_KEY to the private .env file and restart the server.');
    if (window.setBooneViewId) window.setBooneViewId(config.viewId);
    console.info('[Boone startup] Configuration ready');
    map_key = config.mapboxPublicToken;
    const radarReason = map_key ? radarUnavailableReason() : 'no-token';
    if (radarReason) skipRadar(radarReason);
    inSettings = false;
    versionsChanger(appearanceSettings.graphicsPackage);
    stage = 'assets and weather';
    console.info('[Boone startup] Loading assets and weather');
    await Promise.all([preloadFonts(), preloadImages(), grabData()]);
    stage = 'maps';
    if (!radarReason) {
      console.info('[Boone startup] Creating radar maps');
      try {
        await createMaps();
      } catch (_) {
        disposeMaps();
        skipRadar('initialization-failed');
      }
    }
    slideFlavor = slideSettings;
    stage = 'slides';
    console.info('[Boone startup] Starting slides');
    slideKickOff();
    startLoops();
    document.getElementById('startup').remove();
    console.info('[Boone startup] Ready');
    // Browsers may require a click before permitting sound.
    try {
      audioPlayer.startPlaying(audioPlayer.playlist, true);
    } catch (_) {}
  } catch (error) {
    console.error(`[Boone startup] Failed during ${stage} (${error.name || 'Error'})`);
    document.querySelector('#startup span').textContent =
      `Unable to start Boone weather during ${stage}: ${error.message}`;
    document.querySelector('#startup .spinner').hidden = true;
  }
});
