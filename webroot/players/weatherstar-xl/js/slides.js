//wanted to make my own slides class but I think Joe's syntax for slides were better
var slideDivs = {
    "currentConditions": ".current-conditions",
    "nearbyCities": ".eight-cities",
    "dayDesc": ".local-forecast",
    "weekAhead": ".week-ahead",
    "dopplerRadar": ".radar",
    "daypartForecast": ".daypart-forecast",
    "almanac": ".almanac",
    "bulletin": ".bulletin"
}

//to be used later
var slideHeaders = {
    "currentConditions": "*city*",
    "nearbyCities": "",
    "dayDesc": "*city* *ending*",
    "weekAhead": "*city* *ending*"
}

var currentProgram;
var currentDiv;
var animationDelay = appearanceSettings.graphicsPackage == "v3" ? 900 : 1000;

function slideKickOff() {
    idx = 0;
    nidx = 1;
    showSlides();
    displayLDL(0);
}//end of slideKickOff() function

function showSlides() {
    var slidePrograms = {
        currentConditions() {
            try {
                if (weatherInfo.currentConditions.noReport == true) {
                    throw new Error("Current conditions displays no report available");
                }
                audioPlayer.vocallocal = vocallocal(weatherInfo.currentConditions.temp, weatherInfo.currentConditions.icon)
                $('.current-conditions').fadeIn(0);
                if (weatherInfo.currentConditions.feelslike.type != null) {
                    $('.current-conditions .labels').append(`<br><span class="feelslikee">${weatherInfo.currentConditions.feelslike.type}</span>`);
                    $('.left-pane .feelslike').text(weatherInfo.currentConditions.feelslike.val + "°");
                }
                $('.current-conditions .city-name').text(weatherInfo.currentConditions.cityname);
                $('.left-pane .humidity').text(weatherInfo.currentConditions.humidity);
                $('.left-pane .pressure').text(weatherInfo.currentConditions.pressure + " in");
                $('.left-pane .wind').text(weatherInfo.currentConditions.wind);
                $('.left-pane .gusts').text(weatherInfo.currentConditions.gusts);
                $('.left-pane .dewpoint').text(weatherInfo.currentConditions.dewpoint + "°")
                $('.left-pane .ceiling').text(weatherInfo.currentConditions.ceiling === "Unlimited" ? "Unlimited" : (weatherInfo.currentConditions.ceiling + " ft"));
                $('.left-pane .visibility').text(weatherInfo.currentConditions.visibility + " mi");
                $('.current-conditions .temp').text(weatherInfo.currentConditions.temp + "°");
                $('.current-conditions .cond').text(weatherInfo.currentConditions.cond.replace("/Wind", ", Windy"));
                getIcon($('.current-conditions .icon'), weatherInfo.currentConditions.icon, "current");
                setTimeout(() => { if (audioSettings.narrations) { audioPlayer.playCC(true) } }, 250)
                setTimeout(() => {
                    $('.current-conditions .city-name').fadeIn(0);
                    $('.current-conditions .labels').fadeIn(0);
                    $('.current-conditions .information').fadeIn(0);
                }, animationDelay);
                setTimeout(() => {
                    $('.current-conditions').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay)
            } catch (error) {
                console.error(error);
                $('.current-conditions').fadeIn(0);
                $('.current-conditions .city-name').text(weatherInfo.currentConditions.cityname);
                setTimeout(() => { if (audioSettings.narrations) { audioPlayer.playCC(false) } }, 250)
                setTimeout(() => {
                    $('.current-conditions .city-name').fadeIn(0);
                    $('.current-conditions .labels').fadeIn(0);
                    $('.current-conditions .noreport').fadeIn(0);
                }, 900);
                setTimeout(() => {
                    $('.current-conditions').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay)
            }
        },
        nearbyCities() {
            try {
                if (weatherInfo.eightCities.noReport == true) {
                    throw new Error("Local observations do not have data");
                }
                if (weatherInfo.eightCities.cities.length == 0) {
                    slideCallBack();
                    return;
                }
                $('.eight-cities').fadeIn(0);
                var eightSlideCount = 0;
                function eightCities() {
                    var eightSlideArray = ['i', 'ii', 'iii', 'iv'];
                    for (var i = 0; i < 4; i++) {
                        $(`.eight-cities .extra-loc.${eightSlideArray[i]} .city-name`).text("");
                        $(`.eight-cities .extra-loc.${eightSlideArray[i]} .temp`).text("");
                        $(`.eight-cities .extra-loc.${eightSlideArray[i]} .wind`).text("");
                        if (weatherInfo.eightCities.cities[i + eightSlideCount]) {
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .city-name`).text(weatherInfo.eightCities.cities[i + eightSlideCount].name.replaceAll("Township", "Twnshp"));
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .temp`).text(weatherInfo.eightCities.cities[i + eightSlideCount].temp + "°");
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .wind`).text(weatherInfo.eightCities.cities[i + eightSlideCount].wind);
                            getIcon($(`.eight-cities .extra-loc.${eightSlideArray[i]} .icon`), weatherInfo.eightCities.cities[i + eightSlideCount].icon, "current");
                        } else {
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .icon`).fadeOut(0);
                        }
                    }
                }
                eightCities();
                setTimeout(() => {
                    $('.eight-cities .information').fadeIn(0);
                    $('.eight-cities .top').fadeIn(0);
                }, animationDelay);
                if (weatherInfo.eightCities.cities.length > 4) {
                    setTimeout(() => {
                        eightSlideCount = 4;
                        eightCities();
                        setTimeout(() => {
                            $('.eight-cities').fadeOut(0);
                            slideCallBack();
                        }, slideSettings.slideDelay);
                    }, slideSettings.slideDelay)
                } else {
                    setTimeout(() => {
                        $('.eight-cities').fadeOut(0);
                        slideCallBack();
                    }, slideSettings.slideDelay);
                }
            } catch (error) {
                console.error(error);
                if (weatherInfo.eightCities.cities.length == 0) {
                    slideCallBack();
                } else {
                    $('.eight-cities').fadeIn(0);
                    var eightSlideArray = ['i', 'ii', 'iii', 'iv'];
                    for (var i = 0; i < 4; i++) {
                        $(`.eight-cities .extra-loc.${eightSlideArray[i]} .city-name`).text("");
                        if (weatherInfo.eightCities.cities[i]) {
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .city-name`).text(weatherInfo.eightCities.cities[i].name);
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .noreport`).fadeIn(0);
                        } else {
                            $(`.eight-cities .extra-loc.${eightSlideArray[i]} .noreport`).fadeOut(0);
                        }
                    }
                    setTimeout(() => {
                        $('.eight-cities .information').fadeIn(0);
                        $('.eight-cities .top').fadeIn(0);
                    }, 900);
                    if (weatherInfo.eightCities.cities.length > 4) {
                        setTimeout(() => {
                            eightSlideCount = 4;
                            for (var i = 0; i < 4; i++) {
                                $(`.eight-cities .extra-loc.${eightSlideArray[i + 4]} .city-name`).text("");
                                if (weatherInfo.eightCities.cities[i + 4]) {
                                    $(`.eight-cities .extra-loc.${eightSlideArray[i]} .city-name`).text(weatherInfo.eightCities.cities[i + 4].name);
                                    $(`.eight-cities .extra-loc.${eightSlideArray[i]} .noreport`).fadeIn(0);
                                } else {
                                    $(`.eight-cities .extra-loc.${eightSlideArray[i]} .noreport`).fadeOut(0);
                                }
                            }
                            setTimeout(() => {
                                $('.eight-cities').fadeOut(0);
                                slideCallBack();
                            }, slideSettings.slideDelay);
                        }, slideSettings.slideDelay)
                    } else {
                        setTimeout(() => {
                            $('.eight-cities').fadeOut(0);
                            slideCallBack();
                        }, slideSettings.slideDelay);
                    }
                }
            }
        },
        dayDesc() {
            try {
                if (weatherInfo.dayDesc.noReport == true) {
                    throw new Error("36hr forecast has no data");
                }
                $('.local-forecast').fadeIn(0);
                $('.local-forecast .city-name').text(locationConfig.mainCity.extraname);
                $('.local-forecast .slide .period').text(weatherInfo.dayDesc.days[0].name);
                $('.local-forecast .slide .description').text(weatherInfo.dayDesc.days[0].desc);
                setTimeout(() => { if (audioSettings.narrations) { audioPlayer.playLF() } }, 500)
                setTimeout(() => {
                    $('.local-forecast .city-name').fadeIn(0);
                    $('.local-forecast .slide .period').fadeIn(0);
                    $('.local-forecast .slide .description').fadeIn(0);
                }, animationDelay)
                setTimeout(() => {
                    $('.local-forecast .slide .period').text(weatherInfo.dayDesc.days[1].name);
                    $('.local-forecast .slide .description').text(weatherInfo.dayDesc.days[1].desc);
                }, slideSettings.slideDelay);
                setTimeout(() => {
                    $('.local-forecast .slide .period').text(weatherInfo.dayDesc.days[2].name);
                    $('.local-forecast .slide .description').text(weatherInfo.dayDesc.days[2].desc);
                }, slideSettings.slideDelay * 2);
                setTimeout(() => {
                    $('.local-forecast').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay * 3);
            } catch (error) {
                console.error(error);
                $('.local-forecast').fadeIn(0);
                $('.local-forecast .city-name').text(locationConfig.mainCity.extraname);
                setTimeout(() => {
                    $('.local-forecast .noreport').fadeIn(0);
                    $('.local-forecast .city-name').fadeIn(0);
                }, 900)
                setTimeout(() => {
                    $('.local-forecast').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay * 3);
            }
        },
        weekAhead() {
            try {
                if (weatherInfo.weekAhead.noReport == true) {
                    throw new Error("Week Ahead has no data");
                }
                $('.week-ahead').fadeIn(0);
                $('.week-ahead .city-name').text(locationConfig.mainCity.extraname);

                var waDivs = ["i", "ii", "iii", "iv", "v", "vi", "vii"];
                for (var i = 0; i < 7; i++) {
                    if (weatherInfo.weekAhead.days[i].name == "Sat" || weatherInfo.weekAhead.days[i].name == "Sun") {
                        $(`.week-ahead .day.${waDivs[i]} .name`).css("color", "#001cad");
                        $(`.week-ahead .day.${waDivs[i]} .name`).css("text-shadow", "0px 0px black");
                    } else {
                        $(`.week-ahead .day.${waDivs[i]} .weekend`).fadeOut(0);
                    }
                    $(`.week-ahead .day.${waDivs[i]} .name`).text(weatherInfo.weekAhead.days[i].name.toUpperCase());
                    $(`.week-ahead .day.${waDivs[i]} .cond`).text(weatherInfo.weekAhead.days[i].cond);
                    $(`.week-ahead .day.${waDivs[i]} .high`).text(weatherInfo.weekAhead.days[i].high + "°");
                    if(weatherInfo.weekAhead.days[i].low != null){
                        $(`.week-ahead .day.${waDivs[i]} .low`).text(weatherInfo.weekAhead.days[i].low + "°");
                    }
                    getIcon($(`.week-ahead .day.${waDivs[i]} .icon`), weatherInfo.weekAhead.days[i].icon, "forecast");
                }
                setTimeout(() => {
                    if (audioSettings.narrations) { audioPlayer.playEF() }
                    $('.week-ahead .city-name').fadeIn(0);
                    $('.week-ahead .information').fadeIn(0);
                }, 500)
                setTimeout(() => {
                    $('.week-ahead').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay);
            } catch (error) {
                console.error(error);
                $('.week-ahead').fadeIn(0);
                $('.week-ahead .city-name').text(locationConfig.mainCity.extraname);
                setTimeout(() => {
                    if (audioSettings.narrations) { audioPlayer.playEF() }
                    $('.week-ahead .city-name').fadeIn(0);
                    $('.week-ahead .noreport').fadeIn(0);
                }, 500)
                setTimeout(() => {
                    $('.week-ahead').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay);
            }
        },
        dopplerRadar() {
            try {
                $('.radar').fadeIn(0);
                $('#locradar').fadeIn(0);
                $('#locmap').fadeIn(0);
                locmap.resize();
                $('.radar .banner').fadeIn(0);
                if (weatherInfo.bulletin.crawlAlert.enabled == false && appearanceSettings.ldlType != 'crawl') {
                    $('.ldl .crawl').marquee('destroy');
                    clearInterval(ldlInterval);
                    $('.ldl').fadeOut(0);
                }
                startRadar(locradar);

                setTimeout(() => {
                    stopRadar();
                    $('#locradar').fadeOut(0);
                    $('#locmap').fadeOut(0);
                    $('.radar').fadeOut(0);
                    $('.radar .banner').fadeOut(0);
                    slideCallBack();
                    if (weatherInfo.bulletin.crawlAlert.enabled == false) {
                        $('.ldl').fadeIn(0);
                        displayLDL(ldlIdx);
                    }
                }, slideSettings.flavor == 'D' ? slideSettings.slideDelay : (slideSettings.slideDelay * 2));
            } catch (error) {
                console.error(error);
                $('.radar').fadeIn(0);
                $('#locmap').fadeIn(0);
            }
        },
        daypartForecast() {
            try {
                if (weatherInfo.daypartForecast.noReport == true) {
                    throw new Error("Daypart forecast has no data");
                }
                $('.daypart-forecast').css("background-image", `url(images/${appearanceSettings.graphicsPackage}/dpf_${weatherInfo.daypartForecast.dayName}.png)`)
                $('.daypart-forecast').fadeIn(0);
                $('.daypart-forecast .city-name').text(locationConfig.mainCity.extraname);

                var barTemps = [
                    weatherInfo.daypartForecast.times[0].temp,
                    weatherInfo.daypartForecast.times[1].temp,
                    weatherInfo.daypartForecast.times[2].temp,
                    weatherInfo.daypartForecast.times[3].temp,
                ]
                var barMin = Math.min(...barTemps);
                var barMax = Math.max(...barTemps);
                var barRange = barMax - barMin;
                var barminHeight = 48;
                var dpDivs = ["i", "ii", "iii", "iv"]
                for (var i = 0; i < 4; i++) {
                    //the easy part
                    getIcon($(`.daypart-forecast .hour.${dpDivs[i]} .icon`), weatherInfo.daypartForecast.times[i].icon, "forecast");
                    $(`.daypart-forecast .hour.${dpDivs[i]} .name`).text(weatherInfo.daypartForecast.times[i].name);
                    $(`.daypart-forecast .hour.${dpDivs[i]} .cond`).text(weatherInfo.daypartForecast.times[i].cond);
                    $(`.daypart-forecast .hour.${dpDivs[i]} .temp`).text(weatherInfo.daypartForecast.times[i].temp + "°");
                    $(`.daypart-forecast .hour.${dpDivs[i]} .wind`).text(weatherInfo.daypartForecast.times[i].wind);

                    var barHgtMultipler = barRange == 0 ? 45 : ((weatherInfo.daypartForecast.times[i].temp - barMin) / barRange) * 45;
                    //$(`.daypart-forecast .hour.${dpDivs[i]} .bar`).css('height', `${barminHeight + barHgtMultipler}px`);
                    $(`.daypart-forecast .hour.${dpDivs[i]} .temp`).css('margin-top', `${171 - barHgtMultipler}px`);
                    $(`.daypart-forecast .hour.${dpDivs[i]} .bar`).animate({ height: (barHgtMultipler + barminHeight) + "px" }, 1000, 'linear')
                }
                setTimeout(() => {
                    $(`.daypart-forecast .hour.i .temp`).fadeIn(0);
                    $(`.daypart-forecast .hour.ii .temp`).fadeIn(0);
                    $(`.daypart-forecast .hour.iii .temp`).fadeIn(0);
                    $(`.daypart-forecast .hour.iv .temp`).fadeIn(0);
                }, 1000);

                setTimeout(() => {
                    $('.daypart-forecast').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay);
            } catch (error) {
                console.error(error);
                $('.daypart-forecast').css("background-image", `url(images/${appearanceSettings.graphicsPackage}/dpf_${weatherInfo.daypartForecast.dayName}.png)`)
                $('.daypart-forecast').fadeIn(0);
                $('.daypart-forecast .city-name').text(locationConfig.mainCity.extraname);
                $('.daypart-forecast .noreport').fadeIn(0);
                $(`.daypart-forecast .hour.i`).fadeOut(0);
                $(`.daypart-forecast .hour.ii`).fadeOut(0);
                $(`.daypart-forecast .hour.iii`).fadeOut(0);
                $(`.daypart-forecast .hour.iv`).fadeOut(0);

                setTimeout(() => {
                    $('.daypart-forecast').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay);
            }
        },
        almanac() {
            $('.almanac').fadeIn(0);
            $('.almanac .day.i .header').text(weatherInfo.almanac.days[0].day);
            $('.almanac .day.i .sunrise').text(weatherInfo.almanac.days[0].sunrise);
            $('.almanac .day.i .sunset').text(weatherInfo.almanac.days[0].sunset);
            $('.almanac .day.ii .header').text(weatherInfo.almanac.days[1].day);
            $('.almanac .day.ii .sunrise').text(weatherInfo.almanac.days[1].sunrise);
            $('.almanac .day.ii .sunset').text(weatherInfo.almanac.days[1].sunset);

            var mpDivs = ["i", "ii", "iii", "iv"]
            for (var i = 0; i < 4; i++) {
                $(`.almanac .moonphase.${mpDivs[i]} .moon`).css("background-image", `url(images/moonphases/${weatherInfo.almanac.moonphases[i].type}.png)`);
                $(`.almanac .moonphase.${mpDivs[i]} .type`).text(weatherInfo.almanac.moonphases[i].type.toLowerCase());
                $(`.almanac .moonphase.${mpDivs[i]} .date`).text(weatherInfo.almanac.moonphases[i].date);
            }

            setTimeout(() => {
                $('.almanac .information').fadeIn(0);
            }, animationDelay);
            setTimeout(() => {
                $('.almanac').fadeOut(0);
                slideCallBack();
            }, slideSettings.slideDelay);
        },
        bulletin() {
            if (weatherInfo.bulletin.enabled == false || weatherInfo.bulletin.alerts.length == 0) {
                slideCallBack();
            } else {
                $('.bulletin').fadeIn(0);
                var bulletinText = "";
                for (var i = 0; i < 2; i++) {
                    if (!weatherInfo.bulletin.alerts[i]) { continue; }
                    bulletinText = bulletinText + `<span>${weatherInfo.bulletin.alerts[i].desc}</span>\n`;
                }
                $('.bulletin .alerts').append(bulletinText);

                setTimeout(() => {
                    $('.bulletin').fadeOut(0);
                    slideCallBack();
                }, slideSettings.slideDelay);
            }
        }
    } //end of slidePrograms
    if (idx >= slideSettings.order.length) {
        idx = -1;
        $(currentDiv).fadeIn(0);
        $('#main').fadeOut(0);
        clearInterval(dateTimeChanger);
        audioPlayer.stopPlaying();
        //destroy the audioplayer so it doesnt continue after the loop
        audioPlayer = null;
        setTimeout(() =>{
            window.location.reload();
        }, 3000);
    }
    if (nidx >= slideSettings.order.length) {
        nidx = 0;
    }
    currentProgram = slidePrograms[slideSettings.order[idx].function]
    currentDiv = slideDivs[slideSettings.order[idx].function]
    nextProgram = slidePrograms[slideSettings.order[nidx].function]
    nextDiv = slideDivs[slideSettings.order[nidx].function]
    currentProgram();

    function slideCallBack() {
        idx++;
        nidx++;
        showSlides();
    };
}//END OF showSlides() FUNCTION
