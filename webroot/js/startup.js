document.addEventListener('DOMContentLoaded', async () => {
    $.ajaxSetup({timeout: 15000});
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Configuration unavailable');
        const config = await response.json();
        if (!config.weatherConfigured) throw new Error('Add WEATHER_API_KEY to the private .env file and restart the server.');
        map_key = config.mapboxPublicToken;
        if (!map_key) slideSettings.order = slideSettings.order.filter(s => !['radarDoppler', 'localDoppler'].includes(s.function));
        inSettings = false;
        versionsChanger(appearanceSettings.graphicsPackage);
        await Promise.all([preloadFonts(), preloadImages(), grabData()]);
        if (map_key) await createMaps();
        slideFlavor = slideSettings;
        document.getElementById('startup').remove();
        slideKickOff();
        startLoops();
        // Browsers may require a click before permitting sound.
        try { audioPlayer.startPlaying(audioPlayer.playlist, true); } catch (_) {}
    } catch (error) {
        document.querySelector('#startup span').textContent = error.message;
        document.querySelector('#startup .spinner').hidden = true;
    }
});
