(() => {
  const boone = {
    displayname: 'Boone',
    lat: 36.2168,
    lon: -81.6746,
    state: 'NC',
    stateFull: 'North Carolina',
  };
  const dialog = document.getElementById('city-dialog');
  const status = document.getElementById('search-status');
  const results = document.getElementById('city-results');
  function display(city) {
    document.getElementById('city-label').textContent = [city.displayname, city.state]
      .filter(Boolean)
      .join(', ');
  }
  function select(city) {
    try {
      localStorage.setItem('weather-city', JSON.stringify(city));
    } catch {
      status.textContent = 'Your browser could not save this location.';
      return;
    }
    display(city);
    dialog.close();
  }
  try {
    const saved = JSON.parse(localStorage.getItem('weather-city'));
    if (
      saved?.displayname &&
      Number.isFinite(Number(saved.lat)) &&
      Number.isFinite(Number(saved.lon))
    )
      display(saved);
  } catch {
    /* Boone remains the default. */
  }
  document.getElementById('change-city').addEventListener('click', () => dialog.showModal());
  document.getElementById('use-boone').addEventListener('click', () => select(boone));
  let controller;
  document.getElementById('city-search').addEventListener('submit', async (event) => {
    event.preventDefault();
    controller?.abort();
    controller = new AbortController();
    const current = controller;
    results.replaceChildren();
    status.textContent = 'Searching…';
    try {
      const query = document.getElementById('city-query').value.trim();
      const response = await fetch(
        '/api/weather/v3/location/search?' + new URLSearchParams({ query }),
        { signal: current.signal },
      );
      if (!response.ok) throw new Error('Unavailable');
      const { location: locations } = await response.json();
      const count = Math.min(locations?.latitude?.length || 0, 10);
      for (let i = 0; i < count; i++) {
        const city = {
          displayname: locations.city?.[i] || locations.displayName[i],
          lat: locations.latitude[i],
          lon: locations.longitude[i],
          state: locations.adminDistrictCode?.[i] || '',
          stateFull: locations.adminDistrict?.[i] || '',
          timeZone: locations.ianaTimeZone?.[i],
        };
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = [
          city.displayname,
          city.stateFull || city.state,
          locations.country?.[i],
        ]
          .filter(Boolean)
          .join(', ');
        button.addEventListener('click', () => select(city));
        results.append(button);
      }
      status.textContent = count
        ? 'Select your city. It will apply to every player.'
        : 'No cities found. Try adding a state or country.';
    } catch (error) {
      if (error.name !== 'AbortError')
        status.textContent = 'City search is temporarily unavailable. Please try again.';
    }
  });
})();
