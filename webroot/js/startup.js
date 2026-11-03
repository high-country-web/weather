document.addEventListener('DOMContentLoaded', async () => {
    console.info('[Boone startup] Starting');
    let stage = 'configuration';
    $.ajaxSetup({timeout: 15000});
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Configuration unavailable');
        const config = await response.json();
        if (!config.weatherConfigured) throw new Error('Add WEATHER_API_KEY to the private .env file and restart the server.');
        if (window.setBooneViewId) window.setBooneViewId(config.viewId);
        console.info('[Boone startup] Configuration ready');
        map_key = config.mapboxPublicToken;
        if (!map_key) slideSettings.order = slideSettings.order.filter(s => !['radarDoppler', 'localDoppler'].includes(s.function));
        inSettings = false;
        versionsChanger(appearanceSettings.graphicsPackage);
        stage = 'assets and weather';
        console.info('[Boone startup] Loading assets and weather');
        await Promise.all([preloadFonts(), preloadImages(), grabData()]);
        stage = 'maps';
        if (map_key) {
            console.info('[Boone startup] Creating radar maps');
            await createMaps();
        } else {
            console.info('[Boone startup] Public Mapbox token absent; radar slides skipped');
        }
        slideFlavor = slideSettings;
        stage = 'slides';
        console.info('[Boone startup] Starting slides');
        slideKickOff();
        startLoops();
        document.getElementById('startup').remove();
        console.info('[Boone startup] Ready');
        // Browsers may require a click before permitting sound.
        try { audioPlayer.startPlaying(audioPlayer.playlist, true); } catch (_) {}
    } catch (error) {
        console.error(`[Boone startup] Failed during ${stage} (${error.name || 'Error'})`);
        document.querySelector('#startup span').textContent = `Unable to start Boone weather during ${stage}: ${error.message}`;
        document.querySelector('#startup .spinner').hidden = true;
    }
});
