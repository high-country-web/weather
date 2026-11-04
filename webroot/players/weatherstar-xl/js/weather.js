var weatherInfo = {
  currentConditions: {
    cityname: "",
    humidity: "",
    pressure: "",
    wind: "",
    windspeed: "",
    dewpoint: "",
    gusts: "",
    icon: "",
    cond: "",
    temp: "",
    ceiling: "",
    visibility: "",
    feelslike: {type:"",val:""},
    noReport: false
  },
  eightCities: {
    noReport: false,
    cities: [
      //{name:"",temp:"",icon:"",wind:"",windspeed:""}
    ]
  },
  dayDesc: {
    noReport: false,
    days: [
      //{name:"",desc:""}
    ]
  },
  weekAhead: {
    noReport: false,
    days: [
      //{name:"",cond:"",icon:"",high:"",low:"",windspeed:""}
    ]
  },
  daypartForecast: {
    dayName: "",
    noReport: false,
    times: [
      //{name:"",cond:"",icon:"",temp:"",wind:"",windspeed:""}
    ]
  },
  almanac: {
    noReport: false,
    days: [
      //{sunrise:"",sunset:"",day:""}
    ],
    moonphases: [

    ]
  },
  bulletin: {
    enabled: false,
    alerts: [

    ],
    crawlAlert: {
      enabled: false,
      alert: {}
    }
  },
  radarUnavailable: false,
  monthlyPrecip: ""
}

function grabData() {
  //console.log("grabbed data")
  function grabCC() {
    var url = "/api/weather/v3/wx/observations/current?geocode=" + locationConfig.mainCity.lat + "," + locationConfig.mainCity.lon + "&units=e&language=en-US&format=json&apiKey=" + api_key
    $.getJSON(url, function (data) {
      weatherInfo.currentConditions.cityname = locationConfig.mainCity.displayname;
      weatherInfo.currentConditions.cond = data.wxPhraseLong.replace("Thunderstorm", "T'storm").replace("/Wind", "").replace("Thunder in the Vicinity", "Thunder");
      weatherInfo.currentConditions.gusts = ((data.windGust != null || data.windGust != undefined) ? data.windGust + " MPH" : "None");
      weatherInfo.currentConditions.humidity = data.relativeHumidity + "%";
      weatherInfo.currentConditions.icon = data.iconCodeExtend;
      weatherInfo.currentConditions.pressure = data.pressureAltimeter.toFixed(2);
      weatherInfo.currentConditions.temp = data.temperature;
      weatherInfo.currentConditions.dewpoint = data.temperatureDewPoint;
      weatherInfo.currentConditions.wind = ((data.windDirectionCardinal == "CALM" || data.windSpeed == 0) ? "Calm" : data.windDirectionCardinal + " " + data.windSpeed);
      weatherInfo.currentConditions.windspeed = data.windSpeed;
      weatherInfo.currentConditions.ceiling = data.cloudCeiling === null ? "Unlimited" : data.cloudCeiling;
      weatherInfo.currentConditions.visibility = data.visibility;
      weatherInfo.currentConditions.noReport = false;

      if(data.temperatureHeatIndex > data.temperature + 3){
        weatherInfo.currentConditions.feelslike.type = "Heat Index";
        weatherInfo.currentConditions.feelslike.val = data.temperatureHeatIndex;
      } else if(data.temperatureWindChill < data.temperature - 3){
        weatherInfo.currentConditions.feelslike.type = "Wind Chill";
        weatherInfo.currentConditions.feelslike.val = data.temperatureWindChill;
      } else {
        weatherInfo.currentConditions.feelslike.type = null;
      }
    }).fail(function () {
      weatherInfo.currentConditions.cityname = locationConfig.mainCity.displayname;
      weatherInfo.currentConditions.cond = "";
      weatherInfo.currentConditions.gusts = "";
      weatherInfo.currentConditions.humidity = "";
      weatherInfo.currentConditions.icon = 4400;
      weatherInfo.currentConditions.pressure = "";
      weatherInfo.currentConditions.temp = "";
      weatherInfo.currentConditions.wind = "";
      weatherInfo.currentConditions.windspeed = "";
      weatherInfo.currentConditions.ceiling = "";
      weatherInfo.currentConditions.visibility = "";
      weatherInfo.currentConditions.noReport = true;
    })
    //console.log(weatherInfo.currentConditions);
  }

  function grabNearbyCC() {
    weatherInfo.eightCities.cities = [];
    var url = "/api/weather/v3/aggcommon/v3-wx-observations-current?geocodes="
    for (var l = 0; l < 8; l++) {
      if (locationConfig.eightCities.cities[l]) {
        url += locationConfig.eightCities.cities[l].lat + "," + locationConfig.eightCities.cities[l].lon + ";"
      }
    }
    url += "&language=en-US&units=e&format=json&apiKey=" + api_key;

    $.getJSON(url, function (data) {
      data.forEach((ajaxedLoc, i) => {
        var eightslideloc = { name: "", temp: "", icon: "", wind: "", windspeed: "" }
        eightslideloc.name = locationConfig.eightCities.cities[i].displayname;
        eightslideloc.temp = ajaxedLoc["v3-wx-observations-current"].temperature;
        eightslideloc.icon = ajaxedLoc["v3-wx-observations-current"].iconCodeExtend;
        eightslideloc.wind = ajaxedLoc["v3-wx-observations-current"].windDirectionCardinal === "CALM" || ajaxedLoc["v3-wx-observations-current"].windSpeed == 0 ? "Calm" : ajaxedLoc["v3-wx-observations-current"].windDirectionCardinal + " " + ajaxedLoc["v3-wx-observations-current"].windSpeed;
        eightslideloc.windspeed = ajaxedLoc["v3-wx-observations-current"].windSpeed;
        weatherInfo.eightCities.cities.push(eightslideloc)
      })
    }).fail(function () {
      for (var i = 0; i < 8; i++) {
        var eightslideNR = { name: locationConfig.eightCities.cities[i].displayname, temp: "", icon: 4400, wind: "", windspeed: "" }
        weatherInfo.eightCities.cities.push(eightslideNR)
      }
      weatherInfo.eightCities.noReport = true;
    })
    //console.log(weatherInfo.eightCities);
  }
  function grabLocalForecast() {
    //includes 36 hour forecast and week ahead
    weatherInfo.dayDesc.days = [];
    weatherInfo.weekAhead.days = [];
    weatherInfo.almanac.days = [];
    var url = "/api/weather/v3/wx/forecast/daily/7day?geocode=" + locationConfig.mainCity.lat + "," + locationConfig.mainCity.lon + "&format=json&units=e&language=en-US&apiKey=" + api_key;
    $.getJSON(url, function (data) {
      var dayOfWeek = { "-1": "Sunday", 0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday" }
      //36 HOUR
      for (var i = (data.daypart[0].daypartName[0] === null ? 1 : 0); i < (data.daypart[0].daypartName[0] === null ? 4 : 3); i++) {
        var dayDescToAdd = {
          name: data.daypart[0].daypartName[i]
            .replace("Tomorrow", dayOfWeek[new Date().getHours() > 3 ? new Date().getDay() : new Date().getDay() - 1])
            .replace(" night", " Night"),
          desc: data.daypart[0].narrative[i].replaceAll("F. ", ". ")
        }
        weatherInfo.dayDesc.days.push(dayDescToAdd);
      }
      //7 DAY
      for (var j = 0; j < 7; j++) {
        var dayWAtoAdd = { name: "", cond: "", icon: "", high: "", low: "", windspeed: "" }
        dayWAtoAdd.name = data.dayOfWeek[data.daypart[0].wxPhraseLong[0] === null ? j + 1 : j].substring(0, 3);
        dayWAtoAdd.cond = data.daypart[0].wxPhraseLong[(data.daypart[0].wxPhraseLong[0] === null ? (j * 2 + 2) : (j * 2))].replaceAll("Thunderstorms", "Thunder -storms").replaceAll("Scattered", "Sct'd").replaceAll("Thundershowers", "Showers").replaceAll("/Wind", " & Windy").replaceAll("Rain/", "Rain & ").replaceAll("Clouds/PM", "Clouds, PM");
        dayWAtoAdd.windspeed = data.daypart[0].windSpeed[(data.daypart[0].windSpeed[0] === null ? (j * 2 + 2) : (j * 2))];
        dayWAtoAdd.icon = data.daypart[0].iconCodeExtend[(data.daypart[0].iconCodeExtend[0] === null ? (j * 2 + 2) : (j * 2))];
        dayWAtoAdd.high = data.daypart[0].temperature[(data.daypart[0].temperature[0] === null ? (j * 2 + 2) : (j * 2))];
        dayWAtoAdd.low = data.daypart[0].temperature[(data.daypart[0].temperature[0] === null ? (j * 2 + 3) : (j * 2 + 1))];
        if(data.daypart[0].temperature[0] != null && j === 0){
          dayWAtoAdd.low = null;
        }
        weatherInfo.weekAhead.days.push(dayWAtoAdd)
      }
      //ALMANAC
      var almOffset = data.dayOfWeek[0] === null ? 1 : 0;
      var almanacDayOne = {
        day: data.dayOfWeek[almOffset],
        sunrise: new Date(data.sunriseTimeLocal[almOffset]).toLocaleTimeString('en-US', {hour:'numeric',hour12:true,minute:'numeric'}).toLowerCase(),
        sunset: new Date(data.sunsetTimeLocal[almOffset]).toLocaleTimeString('en-US', {hour:'numeric',hour12:true,minute:'numeric'}).toLowerCase()
      }
      weatherInfo.almanac.days.push(almanacDayOne);
      var almanacDayTwo = {
        day: data.dayOfWeek[almOffset+1],
        sunrise: new Date(data.sunriseTimeLocal[almOffset+1]).toLocaleTimeString('en-US', {hour:'numeric',hour12:true,minute:'numeric'}).toLowerCase(),
        sunset: new Date(data.sunsetTimeLocal[almOffset+1]).toLocaleTimeString('en-US', {hour:'numeric',hour12:true,minute:'numeric'}).toLowerCase()
      }
      weatherInfo.almanac.days.push(almanacDayTwo);
    }).fail(function () {
      weatherInfo.dayDesc.noReport = true;
      weatherInfo.weekAhead.noReport = true;
      weatherInfo.almanac.noReport = true;
      var periods = ["Today", "Tonight", "Tomorrow"]
      for (var i = 0; i < 3; i++) {
        var dayDescToAddNR = { name: periods[i], desc: "Temporarily Unavailable" }
        weatherInfo.dayDesc.days.push(dayDescToAddNR);
      }
      for (var j = 0; j < 7; j++) {
        var dayOfWeek = { 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun" }
        var dayWAtoAddNR = { name: dayOfWeek[(new Date().getDay() + j) % 7], cond: "", icon: 4400, high: "", low: "" }
        weatherInfo.weekAhead.days.push(dayWAtoAddNR);
      }
      weatherInfo.almanac.days.push({day:"",sunrise:"",sunset:""});
      weatherInfo.almanac.days.push({day:"",sunrise:"",sunset:""});
    })
    //console.log(weatherInfo.dayDesc);
    //console.log(weatherInfo.weekAhead);
  }

  function grabMoonphases(){
    $.getJSON(`https://www.icalendar37.net/lunar/api/?lang=en&month=${dateFns.format(new Date(),"M")}&year=${dateFns.format(new Date(),"YYYY")}`, function(data){
      for(phase in data.phase){
        if(data.phase[phase].isPhaseLimit != false){
          if(phase < new Date().getDate()){ continue; }
          var moonphaseToAdd = {date:"",type:""}
          moonphaseToAdd.date = data.monthName.substring(0,3) + " " + phase;
          moonphaseToAdd.type = data.phase[phase].phaseName.split(" ")[0];
          weatherInfo.almanac.moonphases.push(moonphaseToAdd);
        }
      }
    })
    setTimeout(() =>{
      $.getJSON(`https://www.icalendar37.net/lunar/api/?lang=en&month=${dateFns.format(dateFns.addMonths(new Date(),1),"M")}&year=${dateFns.format(new Date(),"YYYY")}`, function(data){
        for(phase in data.phase){
          if(data.phase[phase].isPhaseLimit != false){
            var moonphaseToAdd = {date:"",type:""}
            moonphaseToAdd.date = data.monthName.substring(0,3) + " " + phase;
            moonphaseToAdd.type = data.phase[phase].phaseName.split(" ")[0]
          weatherInfo.almanac.moonphases.push(moonphaseToAdd);
          }
        }
      })
    },500)
  }

  function grabDaypartForecast() {
    weatherInfo.daypartForecast.times = [];
    var dpHours = [];
    var dpCurrent = dateFns.getHours(new Date())
    if (dpCurrent < 5) {
      weatherInfo.daypartForecast.dayName = "today";
      dpHours = [6, 12, 15, 17];
    } else if (dpCurrent >= 5 && dpCurrent < 10) {
      weatherInfo.daypartForecast.dayName = "today";
      dpHours = [12, 15, 17, 20];
    } else if (dpCurrent >= 10 && dpCurrent < 14) {
      weatherInfo.daypartForecast.dayName = "today";
      dpHours = [15, 17, 20, 0];
    } else if (dpCurrent >= 14 && dpCurrent < 16) {
      weatherInfo.daypartForecast.dayName = "tonight";
      dpHours = [17, 20, 0, 6];
    } else if (dpCurrent >= 16) {
      weatherInfo.daypartForecast.dayName = "tomorrow";
      dpHours = [6, 12, 15, 17];
    }
    var url = "/api/weather/v3/wx/forecast/hourly/2day?geocode=" + locationConfig.mainCity.lat + "," + locationConfig.mainCity.lon + "&format=json&units=e&language=en-US&apiKey=" + api_key;
    $.getJSON(url, function(data){
      var dpidx = 0;
      for(var i = 0; i < data.validTimeLocal.length; i++){
        var dpTime = dateFns.getHours(data.validTimeLocal[i]);
        if(dpTime == dpHours[dpidx]){
          var dayPartToAdd = {name:"",cond:"",icon:"",temp:"",wind:"",windspeed:""}
          dayPartToAdd.name = {"0":"midnight","6":"6 am","12":"noon","15":"3 pm","17":"5 pm","20":"8 pm"}[dpTime]
          dayPartToAdd.cond = data.wxPhraseLong[i].replaceAll("/Wind", " & Wind").replaceAll("Rain/", "Rain & ");
          dayPartToAdd.icon = data.iconCodeExtend[i]
          dayPartToAdd.temp = data.temperature[i]
          dayPartToAdd.wind = data.windSpeed[i] == 0 ? "Calm" : `${data.windDirectionCardinal[i]} ${data.windSpeed[i]}`
          dayPartToAdd.windspeed = data.windSpeed[i]
          weatherInfo.daypartForecast.times.push(dayPartToAdd);
          dpidx++;
        }
      }
    }).fail(function(){
      weatherInfo.daypartForecast.noReport = true;
      for(var i = 0; i < 4; i++){
        weatherInfo.daypartForecast.times.push({name:"",cond:"",icon:4400,temp:"",wind:"",windspeed:""});
      }
    })
  }

  function grabAlerts(){
    weatherInfo.bulletin.alerts = [];
    $.getJSON(`/api/weather/v3/alerts/headlines?geocode=${locationConfig.mainCity.lat},${locationConfig.mainCity.lon}&format=json&language=en-US&apiKey=${api_key}`, function(data){
      if(!data) return;
      weatherInfo.bulletin.enabled = true;
      for(var i = 0; i < data.alerts.length; i++){
        var bulletinAlert = {
          name: data.alerts[i].eventDescription,
          significance: data.alerts[i].significance,
          desc: `${data.alerts[i].eventDescription}${data.alerts[i].headlineText.endsWith("in effect") ? '' : ' in effect'}${data.alerts[i].headlineText.split(data.alerts[i].eventDescription)[1]}`,
          detailKey: data.alerts[i].detailKey,
          severity: data.alerts[i].severity
        }
        weatherInfo.bulletin.alerts.push(bulletinAlert);
        if(weatherInfo.bulletin.crawlAlert.enabled == false && data.alerts[i].urgencyCode == 1) {
          weatherInfo.bulletin.crawlAlert.enabled = true;
          grabAlertCrawl(data.alerts[i].detailKey);
          weatherInfo.bulletin.alerts.pop();
        }
      }
    }).fail(function(){
      weatherInfo.bulletin.enabled = false;
    })
  }
  function grabAlertCrawl(dKey){
    $.getJSON('/api/weather/v3/alerts/detail?alertId=' + dKey + '&format=json&language=en-US&apiKey=' + api_key, function(data) {
      console.log(data);
      var alert = {
        name: data.alertDetail.eventDescription,
        code: data.alertDetail.productIdentifier,
        type: data.alertDetail.messageType,
        significance: data.alertDetail.significance,
        description: data.alertDetail.texts[0].description,
        severe: getCrawlSeverity(data.alertDetail.productIdentifier),
        detailKey: dKey
      }
      if(alert.severe){
        weatherInfo.bulletin.crawlAlert.alert = [];
      }
      weatherInfo.bulletin.crawlAlert.alert = alert;
    });
  }

  //taken from joe's weatherstar jr sim
  function grabMonthlyPrecip() {
    var url = "/api/weather/v1/geocode/"+ locationConfig.mainCity.lat + "/" + locationConfig.mainCity.lon + "/observations/current.json?language=en-US&units=e&apiKey=" + api_key;
    $.getJSON(url, function(data) {
      try {
        weatherInfo.monthlyPrecip = data.observation.imperial.precip_mtd.toFixed(2) + " in"
      } catch (error) {
        weatherInfo.monthlyPrecip = ""
      }
    }).fail(function() {
      weatherInfo.monthlyPrecip = ""
    })
  }

  //grabbing all data
  grabCC();
  // Nearby city package is not enabled.
  grabLocalForecast();
  grabMoonphases();
  grabDaypartForecast();
  grabMonthlyPrecip();
  grabAlerts();
  console.log(weatherInfo);
}

function startProgram(){
  grabData()
  setTimeout(() => {
    createMaps();
    initializeRadar(locradar);
  }, 3000)
  setTimeout(() => {
    audioPlayer.startPlaying(audioPlayer.playlist, true);
  }, appearanceSettings.startupTime - 500);
  setTimeout(() => {
    $('.date-time').fadeIn(0);
    slideKickOff()
  }, appearanceSettings.startupTime);
}

var dateTimeChanger = setInterval(function () {
  var today = new Date();
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let dateday = weekday[today.getDay()];

  $('#date').text(dateday + " " + today.toString().replace('01', ' 1').replace('02', ' 2').replace('03', ' 3').replace('04', ' 4').replace('05', ' 5').replace('06', ' 6').replace('07', ' 7').replace('08', ' 8').replace('09', ' 9').slice(4, 10).toUpperCase().trimRight());
  $('#time').text(today.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric', second: 'numeric', /*timeZone: locationTimezone != null ? locationTimezone : localTimezone */}).replace(/ /g, ' ').toUpperCase());
}, 1000);