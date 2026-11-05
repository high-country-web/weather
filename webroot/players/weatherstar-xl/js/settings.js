if(appearanceSettings.skipSetup == true){
    setTimeout(() => {
        $('#settings-menu').fadeOut(0);
        $('#settings-menu-content').fadeOut(0);
        setTimeout(() => {
            locationJS();
            setTimeout(startButton, 100);
        }, 100);
    }, 10);
}

setTimeout(() => {
    $(".version").text(`Version ${appearanceSettings.version}`);
    $("#styles").append(`<link rel="stylesheet" href="wxstarxl32${appearanceSettings.graphicsPackage}.css">`);
    setTimeout(() => {  
        $("#styles").children('link').first().remove();
    }, 10);
}, 10);

setTimeout(() => {
    $('.locdisplayname')
        .text(locationConfig.mainCity.displayname + (locationConfig.mainCity.state != null ? ", " + locationConfig.mainCity.state : (locationConfig.mainCity.stateFull != null ? ", " + locationConfig.mainCity.stateFull : '')));
    $('.maincityextraname').text(locationConfig.mainCity.extraname);
    shrinkLocDisplayName();
}, 1500)
var extranameval = undefined;
function startButton() {
    if(locationConfig.mainCity.displayname == undefined){
        $(".locwarning").fadeIn(0);
        $(".locdisplayname").css('color', '#fff');
        setTimeout(() => { $('.locwarning').fadeOut(1000); }, 2500)
        setTimeout(() => { $('.locdisplayname').css('color', ''); }, 3000)
        return;
    }
    if (appearanceSettings.ldlType == '' && slideSettings.flavor == '') {
        appearanceSettings.ldlType = 'both';
        slideSettings.flavor = 'M';
    } else if (appearanceSettings.ldlType == '' && slideSettings.flavor != 'M') {
        appearanceSettings.ldlType = 'observations';
    } else if (slideSettings.flavor == '') {
        slideSettings.flavor = 'M';
    }
    $('#settings-menu').fadeOut(0);
    $('#settings-menu-content').fadeOut(0);
    $('#main').fadeIn(0);
    startProgram();
}

function locSearch(page) {
    var locQuery = page === 'main' ? document.getElementById("loclookup").value : document.getElementById("loclookup2").value;
    if (locQuery == "") {
        $(".locwarning").fadeIn(0);
        setTimeout(() => { $('.locwarning').fadeOut(1000); }, 2500)
        $(".locwarning2").fadeIn(0);
        setTimeout(() => { $('.locwarning2').fadeOut(1000); }, 2500)
        return;
    }
    mainquery = locQuery.split("{")[0];
    mainquerydisplay = locQuery.endsWith("}") ? locQuery.split("{")[1].replaceAll("}","") : undefined;
    console.log(`Searching for ${locQuery}`);
    locationJS();
    setTimeout(() => {
        if (queryFail) {
            if(page == 'main'){
                $('.locwarning').text("ERROR: Location search failed.");
                $('.locwarning').fadeIn(0);
                setTimeout(() => { $('.locwarning').fadeOut(1000); }, 2500);
                setTimeout(() => { $('.locwarning').text("ERROR: Put in a value."); }, 4000);
            } else {
                $('.locwarning2').text("ERROR: Location search failed.");
                $('.locwarning2').fadeIn(0);
                setTimeout(() => { $('.locwarning2').fadeOut(1000); }, 2500);
                setTimeout(() => { $('.locwarning2').text("ERROR: Put in a value."); }, 4000);
            }
            return;
        }
        $('.locdisplayname')
            .text(locationConfig.mainCity.displayname + (locationConfig.mainCity.state != null ? ", " + locationConfig.mainCity.state : (locationConfig.mainCity.stateFull != null ? ", " + locationConfig.mainCity.stateFull : '')));
        $('.maincitydisplayname')
            .text(locationConfig.mainCity.displayname + (locationConfig.mainCity.state != null ? ", " + locationConfig.mainCity.state : (locationConfig.mainCity.stateFull != null ? ", " + locationConfig.mainCity.stateFull : '')));
        $('.maincityextraname').text(locationConfig.mainCity.extraname);
        shrinkLocDisplayName();
        $('.locsuccess').fadeIn(0);
        $('.locsuccess2').fadeIn(0);
        var elDivs = ["i","ii","iii","iv","v","vi","vii","viii"];
        for(var i = 0; i < 8; i++){
            try {
                $(`.extracity.${elDivs[i]} .extrcitydisplayname`).text(locationConfig.eightCities.cities[i].displayname + (locationConfig.eightCities.cities[i].state != null ? ", " + locationConfig.eightCities.cities[i].state : (locationConfig.eightCities.cities[i].stateFull != null ? ", " + locationConfig.eightCities.cities[i].stateFull : '')))
            } catch(error){
                $(`.extracity.${elDivs[i]} .extrcitydisplayname`).text("");
            }
        }
        setTimeout(() => { 
            $('.locsuccess').fadeOut(1000);
            $('.locsuccess2').fadeOut(1000);
            grabData();
        }, 2500)
    }, 1500)
}

function shrinkLocDisplayName() {
    $('.locdisplayname').css('font-size', '30px');
    var ii = parseInt($('.locdisplayname').css('font-size'));
    while ($('.locdisplayname').height() > 39) {
        ii--;
        $('.locdisplayname').css('font-size', ii);
    }
}

//enter key will also work
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loclookup")
        .addEventListener('keydown', (event) => {
            if (event.key == "Enter") {
                event.preventDefault();
                locSearch('main');
                //i wanna make it look like it was pressed
                $('.locsearch').css({
                    'background-color': '#323741',
                    'color': '#fff'
                });
            }
        })
    document.getElementById("loclookup")
        .addEventListener('keyup', (event) => {
            if (event.key == "Enter") {
                $('.locsearch').css({
                    'background-color': '',
                    'color': ''
                });
            }
        })

    document.getElementById("loclookup2")
        .addEventListener('keydown', (event) => {
            if (event.key == "Enter") {
                event.preventDefault();
                locSearch('advloc');
                //i wanna make it look like it was pressed
                $('.locsearch2').css({
                    'background-color': '#323741',
                    'color': '#fff'
                });
            }
        })
    document.getElementById("loclookup2")
        .addEventListener('keyup', (event) => {
            if (event.key == "Enter") {
                $('.locsearch2').css({
                    'background-color': '',
                    'color': ''
                });
            }
        })

    document.getElementById("songinput")
        .addEventListener('change', (event) => {
            if (event.target.value == "N") {
                audioSettings.order = [
                    "Track 1",
                    "Track 2",
                    "Track 3",
                    "Track 4",
                    "Track 5",
                    "Track 6",
                    "Track 7",
                    "Track 8",
                    "Track 9",
                    "Track 10",
                    "Track 11",
                    "Track 12",
                    "Track 13",
                    "Track 14",
                    "Track 15"
                ]
            } else {
                audioSettings.order = [`Track ${parseInt(event.target.value)}`];
            }
            console.log(`Track ${parseInt(event.target.value)}`);
            audioPlayer.buildPlaylist();
            console.log(audioPlayer.playlist);
            //console.log($('#songinput').val('selectedvalue'));
        })

    document.getElementById("songoffset")
        .addEventListener('change', (event) => {
            audioSettings.offset = event.target.value;
            console.log(event.target.value);
        })

    document.getElementById("songuploadinput")
        .addEventListener('change', (event) => {
            if(event.target.files[0]){
                var file = event.target.files[0];
                audioSettings.order = [file.name];
                var url = URL.createObjectURL(file);
                audioPlayer.playlist = [url];
            } else {
                audioSettings.order = [
                    "Track 1",
                    "Track 2",
                    "Track 3",
                    "Track 4",
                    "Track 5",
                    "Track 6",
                    "Track 7",
                    "Track 8",
                    "Track 9",
                    "Track 10",
                    "Track 11",
                    "Track 12",
                    "Track 13",
                    "Track 14",
                    "Track 15"
                ]
                audioPlayer.buildPlaylist();
            }
        })
    
    document.getElementById("locloadconfiginput")
        .addEventListener("change", (event) =>{
            //console.log(event);
            jsonFuncs()
        })

    document.getElementById("locextraname")
        .addEventListener("change", (event) =>{
            extranameval = event.target.value;
        })
})

function setAspectRatio(asp) {
    if (asp == 4 / 3) {
        appearanceSettings.aspectRatio = 4 / 3;
        $('.asp.four-three-button').css("background-color", "#323741");
        $('.asp.four-three-button').css("color", "#ff0000");
        $('.asp.three-two-button').css("background-color", "");
        $('.asp.three-two-button').css("color", "");

        $("#styles").append(`<link rel="stylesheet" href="wxstarxl43${appearanceSettings.graphicsPackage}.css">`);
        setTimeout(() => {  
            $("#styles").children('link').first().remove();
        }, 10);
    } else if (asp == 3 / 2) {
        appearanceSettings.aspectRatio = 3 / 2;
        $('.asp.three-two-button').css("background-color", "#323741");
        $('.asp.three-two-button').css("color", "#ff0000");

        $('.asp.four-three-button').css("background-color", "");
        $('.asp.four-three-button').css("color", "");

        $("#styles").append(`<link rel="stylesheet" href="wxstarxl32${appearanceSettings.graphicsPackage}.css">`);
        setTimeout(() => {  
            $("#styles").children('link').first().remove();
        }, 10);
    }
}

function setFlavor(flavor) {
    switch (flavor) {
        case 'd':
            ldlBothCheck();
            slideSettings.flavor = 'D';
            slideSettings.order = [
                { function: 'currentConditions' },
                { function: "bulletin" },
                { function: 'dayDesc' },
                { function: 'weekAhead' },
                { function: 'dopplerRadar' }
            ]
            $('.flv.onemin-button').css("background-color", "#323741");
            $('.flv.onemin-button').css("color", "#ff0000");
            $('.flv.ninetysec-button').css("background-color", "");
            $('.flv.ninetysec-button').css("color", "");
            $('.flv.twomin-button').css("background-color", "");
            $('.flv.twomin-button').css("color", "");
            break;
        case 'k':
            ldlBothCheck();
            slideSettings.flavor = 'K';
            slideSettings.order = [
                { function: 'currentConditions' },
                { function: 'nearbyCities' },
                { function: "bulletin" },
                { function: 'dopplerRadar' },
                { function: 'dayDesc' },
                { function: 'weekAhead' }
            ]
            $('.flv.onemin-button').css("background-color", "");
            $('.flv.onemin-button').css("color", "");
            $('.flv.ninetysec-button').css("background-color", "#323741");
            $('.flv.ninetysec-button').css("color", "#ff0000");
            $('.flv.twomin-button').css("background-color", "");
            $('.flv.twomin-button').css("color", "");
            break;
        case 'm':
            slideSettings.flavor = 'M';
            slideSettings.order = [
                { function: "currentConditions" },
                { function: "nearbyCities" },
                { function: "bulletin" },
                { function: "dopplerRadar" },
                { function: "almanac" },
                { function: "daypartForecast" },
                { function: "dayDesc" },
                { function: "weekAhead" },
            ]
            $('.flv.onemin-button').css("background-color", "");
            $('.flv.onemin-button').css("color", "");
            $('.flv.ninetysec-button').css("background-color", "");
            $('.flv.ninetysec-button').css("color", "");
            $('.flv.twomin-button').css("background-color", "#323741");
            $('.flv.twomin-button').css("color", "#ff0000");
            break;
        default:
            console.log("How did you get here bro?");
            break;
    }
}

function ldlBothCheck() {
    if (appearanceSettings.ldlType != 'both') return;
    appearanceSettings.ldlType = 'observations';
    $('.ldlbut.obs-button').css("background-color", "#323741");
    $('.ldlbut.obs-button').css("color", "#ff0000");
    $('.ldlbut.crawl-button').css("background-color", "");
    $('.ldlbut.crawl-button').css("color", "");
    $('.ldlbut.both-button').css("background-color", "");
    $('.ldlbut.both-button').css("color", "");
    $('.ldlwarning').fadeIn(0);
    setTimeout(() => { $('.ldlwarning').fadeOut(1000); }, 2500);
}

function setLDLType(type) {
    switch (type) {
        case 'observations':
            appearanceSettings.ldlType = 'observations';
            $('.ldlbut.obs-button').css("background-color", "#323741");
            $('.ldlbut.obs-button').css("color", "#ff0000");
            $('.ldlbut.crawl-button').css("background-color", "");
            $('.ldlbut.crawl-button').css("color", "");
            $('.ldlbut.both-button').css("background-color", "");
            $('.ldlbut.both-button').css("color", "");
            break;
        case 'crawl':
            appearanceSettings.ldlType = 'crawl';
            $('.ldlbut.obs-button').css("background-color", "");
            $('.ldlbut.obs-button').css("color", "");
            $('.ldlbut.crawl-button').css("background-color", "#323741");
            $('.ldlbut.crawl-button').css("color", "#ff0000");
            $('.ldlbut.both-button').css("background-color", "");
            $('.ldlbut.both-button').css("color", "");
            break;
        case 'both':
            if (slideSettings.flavor != 'M' && slideSettings.flavor != '') {
                $('.ldlwarning').fadeIn(0);
                setTimeout(() => { $('.ldlwarning').fadeOut(1000); }, 2500);
                return;
            }
            appearanceSettings.ldlType = 'both';
            $('.ldlbut.obs-button').css("background-color", "");
            $('.ldlbut.obs-button').css("color", "");
            $('.ldlbut.crawl-button').css("background-color", "");
            $('.ldlbut.crawl-button').css("color", "");
            $('.ldlbut.both-button').css("background-color", "#323741");
            $('.ldlbut.both-button').css("color", "#ff0000");
            break;

        default:
            console.log("How did you get here bro?");
            break;
    }
}

function songSettings(fade) {
    if (fade == "in") {
        $("#settings-menu-content").fadeOut(500);
        setTimeout(() => {
            $("#song-settings").fadeIn(500);
        }, 500);
    }
    if (fade == "out") {
        $("#song-settings").fadeOut(500);
        setTimeout(() => {
            $("#settings-menu-content").fadeIn(500);
        }, 500);
    }
}

function versionSettings(fade, version){
    if(fade == "in"){
        $("#settings-menu-content").fadeOut(500);
        setTimeout(() => {
            $("#version-settings").fadeIn(500);
        }, 500);
    }
    if (fade == "out") {
        $("#version-settings").fadeOut(500);
        setTimeout(() => {
            $("#settings-menu-content").fadeIn(500);
        }, 500);
    }
    if(version == "vv"){return;}

    if(version == "v1"){
        $(".versionwarning").fadeIn(0);
        setTimeout(() => {
            $(".versionwarning").fadeOut(500);
        }, 4000);
        return;
        // $("#styles").append(`<link rel="stylesheet" href="css/wxstarxlv1.css">`);
        // setTimeout(() => {  
        //     $("#styles").children('link').first().remove();
        // }, 10);
    } else {
        $("#styles").append(`<link rel="stylesheet" href="wxstarxl${appearanceSettings.aspectRatio == 3/2 ? "32" : "43"}${version}.css">`);
        setTimeout(() => {  
            $("#styles").children('link').first().remove();
        }, 10);
    }
    appearanceSettings.graphicsPackage = version;
}

function locationSetting(fade){
    if(fade == "in"){
        $("#settings-menu-content").fadeOut(500);
        $('.xllogo').fadeOut(500);
        setTimeout(() => {
            $("#location-settings").fadeIn(500);
        }, 500);
    }
    if (fade == "out") {
        $("#location-settings").fadeOut(500);
        setTimeout(() => {
            $('.xllogo').fadeIn(500);
            $("#settings-menu-content").fadeIn(500);
        }, 500);
    }
    $('.maincitydisplayname').text(locationConfig.mainCity.displayname + (locationConfig.mainCity.state != null ? ", " + locationConfig.mainCity.state : (locationConfig.mainCity.stateFull != null ? ", " + locationConfig.mainCity.stateFull : '')));
    $('.maincityextraname').text(locationConfig.mainCity.extraname);
    var elDivs = ["i","ii","iii","iv","v","vi","vii","viii"];
    for(let i = 0; i < locationConfig.eightCities.cities.length; i++){
        setTimeout(() =>{
            $(`.extracity.${elDivs[i]} .extrcitydisplayname`).text(locationConfig.eightCities.cities[i].displayname + (locationConfig.eightCities.cities[i].state != null ? ", " + locationConfig.eightCities.cities[i].state : (locationConfig.eightCities.cities[i].stateFull != null ? ", " + locationConfig.eightCities.cities[i].stateFull : '')))
        }, 20*i)
    }
    $('.locdisplayname')
        .text(locationConfig.mainCity.displayname + (locationConfig.mainCity.state != null ? ", " + locationConfig.mainCity.state : (locationConfig.mainCity.stateFull != null ? ", " + locationConfig.mainCity.stateFull : '')));
}

function saveLocationSettings(fadesuccess){
    locationSettings.mainCity.autoFind = false;
    locationSettings.mainCity.displayname = locationConfig.mainCity.displayname;
    locationSettings.mainCity.extraname = locationConfig.mainCity.extraname;
    locationSettings.mainCity.type = "geocode";
    locationSettings.mainCity.val = `${locationConfig.mainCity.lat},${locationConfig.mainCity.lon}`;
    for(var i = 0; i < 8; i++){
        if(newEightCities[i].info != false){
            locationConfig.eightCities.cities[i] = newEightCities[i];
        }
    }
    setTimeout(() => {
        locationSettings.eightCities.autoFind = false;
        for(var j = 0; j < 8; j++){
            locationSettings.eightCities.cities[j].displayname = locationConfig.eightCities.cities[j].displayname;
            locationSettings.eightCities.cities[j].type = "geocode";
            locationSettings.eightCities.cities[j].val = `${locationConfig.eightCities.cities[j].lat},${locationConfig.eightCities.cities[j].lon}`;
        }
        setTimeout(() => {
            if(fadesuccess){
                console.log(locationSettings);
                console.log(locationConfig);
                $('.extralocationsuccess').fadeIn(0);

                setTimeout(() => {
                    $('.extralocationsuccess').fadeOut(1000);
                    setTimeout(() =>{},1500);
                }, 2500);
            }
        }, 500);
    }, 500);
}

var cookieDivs = ["One","Two","Three","Four","Five","Six","Seven","Eight"]
function saveLocationCookies(){
    saveLocationSettings()
    setTimeout(() => {
        try {
            document.cookie = `mainCityAutoFind=false`;
            document.cookie = `mainCityName=${locationConfig.mainCity.displayname}`;
            document.cookie = `mainCityExtraName=${locationConfig.mainCity.extraname}`;
            document.cookie = `mainCityType=geocode`;
            document.cookie = `mainCityVal=${locationConfig.mainCity.lat},${locationConfig.mainCity.lon}`;
            document.cookie = `eightCitiesAutoFind=false`;
            for(var i = 0; i < locationConfig.eightCities.cities.length; i++){
                document.cookie = `eightCitiesName${cookieDivs[i]}=${locationConfig.eightCities.cities[i].displayname}`;
                document.cookie = `eightCitiesType${cookieDivs[i]}=geocode`;
                document.cookie = `eightCitiesVal${cookieDivs[i]}=${locationConfig.eightCities.cities[i].lat},${locationConfig.eightCities.cities[i].lon}`;
            }
            setTimeout(() => {
                $('.extralocationsuccess').text("Success! Cookies saved.");
                $('.extralocationsuccess').fadeIn(0);

                setTimeout(() => {
                    $('.extralocationsuccess').fadeOut(1000);
                    setTimeout(() => {$('.extralocationsuccess').text("Success! Locations changed.");},1500);
                }, 2500);
            }, 250);
        }catch(error){
            $('.extralocationfail').text("ERROR: Something went wrong.");
            $('.extralocationfail').fadeIn(0);
            setTimeout(() => {
                $('.extralocationfail').fadeOut(1000);
                setTimeout(() =>{$('.extralocationfail').text(`ERROR: Location ${1}'s search failed.`);},1500);
            }, 2500);
        }
    }, 1000);
}
function loadLocationCookies(){
    if(!document.cookie){
        $('.extralocationfail').text("You don't have any cookies saved!");
        $('.extralocationfail').fadeIn(0)
        setTimeout(() => {
            $('.extralocationfail').fadeOut(1000);
            setTimeout(() =>{$('.extralocationfail').text(`ERROR: Location ${1}'s search failed.`);},1500);
        }, 2500);
        return;
    }
    locationSettings.mainCity.autoFind = getCookie("mainCityAutoFind") == "false" ? false : true;
    locationSettings.eightCities.autoFind = getCookie("eightCitiesAutoFind") == "false" ? false : true;
    locationSettings.mainCity.displayname = getCookie("mainCityName");
    locationSettings.mainCity.extraname = getCookie("mainCityExtraName");
    locationSettings.mainCity.type = getCookie("mainCityType");
    locationSettings.mainCity.val = getCookie("mainCityVal");
    for(let i = 0; i < locationSettings.eightCities.cities.length; i++){
        locationSettings.eightCities.cities[i].displayname = getCookie(`eightCitiesName${cookieDivs[i]}`);
        locationSettings.eightCities.cities[i].type = getCookie(`eightCitiesType${cookieDivs[i]}`);
        locationSettings.eightCities.cities[i].val = getCookie(`eightCitiesVal${cookieDivs[i]}`);
    }
    setTimeout(() => {
        locationJS()
        setTimeout(() => {
            console.log(locationSettings);
            locationSetting(0);
            $('.extralocationsuccess').text("Success! Cookies loaded.");
            $('.extralocationsuccess').fadeIn(0);
            setTimeout(() => {
                $('.extralocationsuccess').fadeOut(1000);
                setTimeout(() => {$('.extralocationsuccess').text("Success! Locations changed.");}, 1500);
            }, 2500);
        }, 500);
    }, 500);
}
function downloadConfig(){
    saveLocationSettings()
    setTimeout(() => {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locationSettings));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `${locationConfig.mainCity.displayname}-${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }, 1500);
}
function jsonFuncs() {
  //credit: MapGuy
  const fileInput = document.getElementById('locloadconfiginput');
  const file = fileInput.files[0];
  if (!file) {
    $('.json-warning').fadeIn(0)
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      console.log(json);
      Object.assign(locationSettings, json);
      console.log("Updated location settings:", locationSettings);
      locationJS()
      setTimeout(() => {
        locationSetting(0);
        $('.extralocationsuccess').text("Success! JSON loaded.");
        $('.extralocationsuccess').fadeIn(0)
        setTimeout(() => {
            $('.extralocationsuccess').fadeOut(1000);
            setTimeout(() => {$('.extralocationsuccess').text("Success! Locations changed.");}, 1500);
        }, 2500);
      }, 1000);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      $('.extralocationfail').text("ERROR: Something went wrong.");
      $('.extralocationfail').fadeIn(0)
      setTimeout(() => {
        $('.extralocationfail').fadeOut(1000);
        setTimeout(() =>{$('.extralocationfail').text(`ERROR: Location ${1}'s search failed.`);},1500);
      }, 2500);
    }
  };
  reader.readAsText(file);
}

function saveExtraName(){
    if(extranameval == undefined){
        return;
    }
    locationConfig.mainCity.extraname = extranameval;
    $('.maincityextraname').text(extranameval);
    setTimeout(() => {
        extranameval = undefined;
    }, 500);
}