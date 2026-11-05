// Shared location format also used by the original IntelliStar viewer.
window.weatherHub = (() => {
  const boone = {
    displayname: 'Boone',
    lat: 36.2168,
    lon: -81.6746,
    state: 'NC',
    stateFull: 'North Carolina',
  };
  let city = boone;
  try {
    const saved = JSON.parse(localStorage.getItem('weather-city'));
    if (
      saved &&
      typeof saved.displayname === 'string' &&
      saved.displayname.length <= 100 &&
      Number.isFinite(Number(saved.lat)) &&
      Number.isFinite(Number(saved.lon)) &&
      Math.abs(saved.lat) <= 90 &&
      Math.abs(saved.lon) <= 180
    )
      city = saved;
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  const params = new URLSearchParams(location.search);
  if (params.has('city') && params.has('lat') && params.has('lon')) {
    const candidate = {
      displayname: params.get('city'),
      lat: Number(params.get('lat')),
      lon: Number(params.get('lon')),
      state: params.get('state') || '',
    };
    if (
      candidate.displayname.length <= 100 &&
      Number.isFinite(candidate.lat) &&
      Math.abs(candidate.lat) <= 90 &&
      Number.isFinite(candidate.lon) &&
      Math.abs(candidate.lon) <= 180
    )
      city = candidate;
  }
  const pending = new Set();
  $.ajaxPrefilter((options, original, xhr) => {
    const url = new URL(options.url, location.href);
    if (url.origin === location.origin && url.pathname.startsWith('/api/weather/')) {
      url.searchParams.delete('apiKey');
      url.searchParams.delete('apikey');
      // Legacy station lookups use the selected city's coordinates.
      if (url.searchParams.has('icaoCode')) {
        url.searchParams.delete('icaoCode');
        url.searchParams.set('geocode', `${city.lat},${city.lon}`);
      }
      options.url = url.pathname + url.search;
      options.timeout = 15000;
      xhr.fail(() => console.warn(`[Weather] ${url.pathname} HTTP ${xhr.status}`));
      pending.add(xhr);
      xhr.always(() => pending.delete(xhr));
    }
  });
  async function settle() {
    while (pending.size)
      await Promise.allSettled([...pending].map((request) => Promise.resolve(request)));
  }
  return { city, boone, settle };
})();
