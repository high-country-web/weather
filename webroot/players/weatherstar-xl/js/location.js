var locationConfig = {
    mainCity: {
        displayname: "",
        extraname: "",
        lat: "",
        lon: "",
        state: "",
        stateFull: "",
    },
    eightCities: {
        cities: [],
    }
}
var newEightCities = [
    {info:false},{info:false},{info:false},{info:false},{info:false},{info:false},{info:false},{info:false}
]
var mainquery = undefined;
var mainquerydisplay = undefined;
var queryFail = false;
async function locationJS() {
    await getMainCity(mainquery);
    setTimeout(() => {
        console.log(locationConfig);
        mainquery = undefined;  
    }, 500);
}

async function getMainCity(query) {
    if (query != undefined) {
        $.getJSON("/api/weather/v3/location/search?query=" + query + "&language=en-US&format=json&apiKey=" + api_key, function (data) {
            locationConfig.mainCity.displayname = mainquerydisplay == undefined ? data.location.displayName[0] : mainquerydisplay;
            locationConfig.mainCity.extraname = data.location.displayName[0] + " Area";
            locationConfig.mainCity.lat = data.location.latitude[0];
            locationConfig.mainCity.lon = data.location.longitude[0];
            locationConfig.mainCity.state = data.location.adminDistrictCode[0];
            locationConfig.mainCity.stateFull = data.location.adminDistrict[0];
            setTimeout(() => {
                getNearbyCities(data.location.latitude[0], data.location.longitude[0], true);
            }, 50);
        }).fail(function () {
            queryFail = true;
        })
    } else if (locationSettings.mainCity.autoFind == false) {
        $.getJSON("/api/weather/v3/location/point?" + locationSettings.mainCity.type + "=" + locationSettings.mainCity.val + "&language=en-US&format=json&apiKey=" + api_key, function (data) {
            locationConfig.mainCity.displayname = locationSettings.mainCity.displayname != "" ? locationSettings.mainCity.displayname : data.location.displayName;
            locationConfig.mainCity.extraname = locationSettings.mainCity.extraname != "" ? locationSettings.mainCity.extraname : data.location.displayName + " Area";
            locationConfig.mainCity.lat = data.location.latitude;
            locationConfig.mainCity.lon = data.location.longitude;
            locationConfig.mainCity.state = data.location.adminDistrictCode;
            locationConfig.mainCity.stateFull = data.location.adminDistrict;
            setTimeout(() => {
                getNearbyCities(data.location.latitude, data.location.longitude, locationSettings.eightCities.autoFind);
            }, 50);
        }).fail(function () {
            queryFail = true;
        })
    } else {
        $.getJSON("/api/location-disabled", function (data) {
            locationConfig.mainCity.displayname = data.city;
            locationConfig.mainCity.extraname = data.city + " Area";
            locationConfig.mainCity.lat = data.lat;
            locationConfig.mainCity.lon = data.lon;
            locationConfig.mainCity.state = data.region;
            locationConfig.mainCity.stateFull = data.regionName;
            setTimeout(() => {
                getNearbyCities(data.lat, data.lon, true);
            }, 50);
        }).fail(function () {
            queryFail = true;
            locationConfig.mainCity.displayname = undefined;
            locationConfig.mainCity.lat = undefined;
            locationConfig.mainCity.lon = undefined;
            locationConfig.mainCity.state = undefined;
            locationConfig.mainCity.stateFull = undefined;
        })
    }
}
async function getNearbyCities(lat, lon, autoFind) {
    locationConfig.eightCities.cities = [];
    if (!autoFind) {
        for (let i = 0; i < locationSettings.eightCities.cities.length; i++) {
            setTimeout(() => {
                createNewCity(locationSettings.eightCities.cities[i].type, locationSettings.eightCities.cities[i].val, i, true);
            }, 50*i);
        }
    } else {
        $.getJSON(`/api/weather/v3/location/near?geocode=${lat},${lon}&product=observation&format=json&apiKey=${api_key}`, function(data){
            for(let i = 0; i < data.location.latitude.length; i++){
                createNewCity("geocode", `${data.location.latitude[i]},${data.location.longitude[i]}`, i, false);
            }
        })
        setTimeout(() => {
            locationConfig.eightCities.cities.sort((a, b) =>{return a.displayname.localeCompare(b.displayname)});
        }, 500);
    }
}
async function createNewCity(type, val, i, manual) {
    $.getJSON(`/api/weather/v3/location/point?${type}=${val}&language=en-US&format=json&apiKey=${api_key}`, function (data) {
        var cityObj = {
            displayname: data.location.displayName,
            lat: data.location.latitude,
            lon: data.location.longitude,
            state: data.location.adminDistrictCode,
            stateFull: data.location.adminDistrict
        }
        if(manual == true){
            cityObj.displayname = locationSettings.eightCities.cities[i].displayname == "" ? data.location.displayName : locationSettings.eightCities.cities[i].displayname;
            locationConfig.eightCities.cities.push(cityObj);
        }else{
            for(let j = 0; j < locationConfig.eightCities.cities.length; j++){
                if(cityObj.displayname == locationConfig.mainCity.displayname) return;
                if(cityObj.displayname == locationConfig.eightCities.cities[j].displayname) return;
                if(cityObj.displayname == locationConfig.eightCities.cities[j].stateFull) return;
                if(locationConfig.eightCities.cities.length >= 8) return;
            }
            locationConfig.eightCities.cities.push(cityObj);
        }
    })
}
async function createNewExtraCity(i){
    var extraquery = document.getElementById(`extralookup${i+1}`).value.split("{")[0];
    var extraquerydisplay = document.getElementById(`extralookup${i+1}`).value.endsWith("}") ? document.getElementById(`extralookup${i+1}`).value.split("{")[1].replace("}","") : undefined;
    console.log(extraquerydisplay)
    $.getJSON(`/api/weather/v3/location/search?query=${extraquery}&language=en-US&format=json&apiKey=${api_key}`, function(data){
        newEightCities[i] = {
            displayname: extraquerydisplay == undefined ? data.location.displayName[0] : extraquerydisplay,
            lat: data.location.latitude[0],
            lon: data.location.longitude[0],
            state: data.location.adminDistrictCode[0],
            stateFull: data.location.adminDistrict[0]       
        }
        var elDivs = ["i","ii","iii","iv","v","vi","vii","viii"];
        $(`.extracity.${elDivs[i]} .extrcitydisplayname`).text(newEightCities[i].displayname + (newEightCities[i].state != null ? ", " + newEightCities[i].state : (newEightCities[i].stateFull != null ? ", " + newEightCities[i].stateFull : '')))
    }).fail(function(){
        $('.extralocationfail').text(`ERROR: Location ${i+1}'s search failed.`);
        $('.extralocationfail').fadeIn(0);
        setTimeout(() => {
            $('.extralocationfail').fadeOut(1000);
        }, 2500);
    })
}
