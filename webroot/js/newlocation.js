// Boone is the default; a viewer's choice is local to their own browser.
const defaultWeatherCity = {
  displayname: 'Boone',
  extraname: 'Boone',
  lat: 36.2168,
  lon: -81.6746,
  state: 'NC',
  stateFull: 'North Carolina',
};
function validWeatherCity(city) {
  return (
    city &&
    typeof city.displayname === 'string' &&
    city.displayname.trim().length > 0 &&
    city.displayname.length <= 150 &&
    Number.isFinite(city.lat) &&
    Math.abs(city.lat) <= 90 &&
    Number.isFinite(city.lon) &&
    Math.abs(city.lon) <= 180
  );
}
let selectedWeatherCity = defaultWeatherCity;
try {
  const saved = JSON.parse(localStorage.getItem('weather-city') || 'null');
  if (validWeatherCity(saved)) selectedWeatherCity = saved;
} catch (_) {}
const cityParameters = new URLSearchParams(location.search);
if (cityParameters.has('city') && cityParameters.has('lat') && cityParameters.has('lon')) {
  const city = {
    displayname: cityParameters.get('city'),
    lat: Number(cityParameters.get('lat')),
    lon: Number(cityParameters.get('lon')),
    state: cityParameters.get('state') || '',
  };
  if (validWeatherCity(city)) selectedWeatherCity = city;
}
selectedWeatherCity = {
  ...selectedWeatherCity,
  extraname: selectedWeatherCity.displayname,
  state: typeof selectedWeatherCity.state === 'string' ? selectedWeatherCity.state : '',
  stateFull: typeof selectedWeatherCity.stateFull === 'string' ? selectedWeatherCity.stateFull : '',
};
appearanceSettings.marqueeAd = [
  [selectedWeatherCity.displayname, selectedWeatherCity.stateFull || selectedWeatherCity.state]
    .filter(Boolean)
    .join(', '),
];
var locationConfig = {
  mainCity: selectedWeatherCity,
  eightCities: { cities: [] },
  regionalMap: { map: [], autoFind: false },
  radarCities: { local: [], regional: [] },
};
