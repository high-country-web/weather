var ldlInterval;
var ldlDelay = 8000;
var ldlIdx = 0;
var warningCrawlEnabled = false;

function adCrawl(){
    var crawlIdx = Math.floor(Math.random() * appearanceSettings.marqueeAd.length);
    $('.ldl .crawl').text(appearanceSettings.marqueeAd[crawlIdx])
    $('.ldl .crawl').marquee({ speed: 170, pauseOnHover: false }).on('finished', () =>{
        $('.ldl .crawl').text("");
        $('.ldl .crawl').marquee('destroy');
    })
}

function displayLDL(idx){
    if(slideSettings.flavor == 'D') {ldlDelay = 7150;}
    if(weatherInfo.bulletin.crawlAlert.enabled){
        if(warningCrawlEnabled == false){
            $('.ldl .warning-crawl').fadeIn(0);
            console.log(weatherInfo.bulletin.crawlAlert.alert.significance);
            $('.ldl .warning-crawl').css('background-image', `url(images/crawl/alert_${weatherInfo.bulletin.crawlAlert.alert.significance}.png)`);
            $('.ldl .warning-crawl .title').text(weatherInfo.bulletin.crawlAlert.alert.name);
            $('.ldl .warning-crawl .marquee').text(weatherInfo.bulletin.crawlAlert.alert.description.toUpperCase());
            $('.ldl .warning-crawl .marquee').marquee({speed: 170, pauseOnHover: false});
            if(weatherInfo.bulletin.crawlAlert.alert.severe) {audioPlayer.playWarningBeep();}
            warningCrawlEnabled = true;
            return;
            //bulletin.crawlAlert.alert.significance
        }
    }
    if(appearanceSettings.ldlType == 'crawl'){
        if(ldlIdx == -1) return;
        $('.ldl .upper-text').fadeOut(0);
        $('.ldl .lower-text').fadeOut(0);
        adCrawl();
        ldlIdx = -1;
        return;
    }
    if(weatherInfo.currentConditions.noReport == true){
        throw new Error("LDL will not display due to no report on current conditions");
    }
    if(appearanceSettings.graphicsPackage == "v1" && ldlRound == 0){
        $('.ldl .upper-text').fadeOut(0);
        $('.ldl .lower-text').fadeOut(0);
        adCrawl();
        return;
    }
    var displays = {
        currentObs(){
            $('.ldl .upper-text').fadeIn(0);
            $('.ldl .lower-text').fadeIn(0);
            $('.ldl .lower-text.left .cc').fadeIn(0);
            $('.ldl .upper-text').text("CURRENTLY AT  " + locationConfig.mainCity.displayname.toUpperCase());
            $('.ldl .lower-text.left .cc').text(weatherInfo.currentConditions.cond);

            ldlInterval = setTimeout(() =>{
                $('.ldl .lower-text.left .cc').fadeOut(0);
                displayLDL(idx);
            }, ldlDelay)
        },
        temperature(){
            $('.ldl .lower-text.left .label').text("Temp");
            $('.ldl .lower-text.left .cond').text(weatherInfo.currentConditions.temp + "°");
            if(weatherInfo.currentConditions.feelslike.type != null){
                $('.ldl .lower-text.right').fadeIn(0);
                $('.ldl .lower-text.right .label').text(weatherInfo.currentConditions.feelslike.type);
                $('.ldl .lower-text.right .cond').text(weatherInfo.currentConditions.feelslike.val + "°");
            }

            ldlInterval = setTimeout(() =>{
                $('.ldl .lower-text.right').fadeOut(0);
                displayLDL(idx);
            },ldlDelay);
        },
        wind(){
            $('.ldl .lower-text.left .label').text("Wind");
            $('.ldl .lower-text.left .cond').text(weatherInfo.currentConditions.wind);
            if(weatherInfo.currentConditions.gusts != "None"){
                $('.ldl .lower-text.right').fadeIn(0);
                $('.ldl .lower-text.right .label').text("Gusts");
                $('.ldl .lower-text.right .cond').text(weatherInfo.currentConditions.gusts);
            }

            ldlInterval = setTimeout(() =>{
                displayLDL(idx);
            },ldlDelay);
        },
        humidityDewPoint(){
            $('.ldl .lower-text.right').fadeIn(0);
            $('.ldl .lower-text.left .label').text("Humidity");
            $('.ldl .lower-text.left .cond').text(weatherInfo.currentConditions.humidity);
            $('.ldl .lower-text.right .label').text("Dew Point");
            $('.ldl .lower-text.right .cond').text(weatherInfo.currentConditions.dewpoint + "°");

            ldlInterval = setTimeout(() =>{
                displayLDL(idx);
            },ldlDelay);
        },
        pressure(){
            $('.ldl .lower-text.right').fadeOut(0);
            $('.ldl .lower-text.left .label').text("Pressure");
            $('.ldl .lower-text.left .cond').text(weatherInfo.currentConditions.pressure + " in");

            ldlInterval = setTimeout(() =>{
                displayLDL(idx);
            },ldlDelay);
        },
        ceilingAndVisibility(){
            $('.ldl .lower-text.right').fadeIn(0);
            $('.ldl .lower-text.left .label').text("Ceiling");
            $('.ldl .lower-text.left .cond').text(weatherInfo.currentConditions.ceiling + (weatherInfo.currentConditions.ceiling == "Unlimited" ? "" : " ft"));
            $('.ldl .lower-text.right .label').text("Visibility");
            $('.ldl .lower-text.right .cond').text(weatherInfo.currentConditions.visibility + " mi");

            ldlInterval = setTimeout(() =>{
                displayLDL(idx);
            },ldlDelay);
        },
        precipitation(){
            $('.ldl .lower-text.right').fadeOut(0);
            $('.ldl .lower-text.left .label').text(new Date().toLocaleDateString('en-US', {month: 'long'}) + " Precipitation");
            $('.ldl .lower-text.left .cond').text(weatherInfo.monthlyPrecip);
            if(appearanceSettings.aspectRatio == 3/2){
                $('.ldl .lower-text.left .cond').css('padding-left', '270px');
            }
            if(appearanceSettings.aspectRatio == 4/3){
                $('.ldl .lower-text.left .cond').css('padding-left', '144px');
            }

            ldlInterval = setTimeout(() =>{
                $('.ldl .upper-text').fadeOut(0);
                $('.ldl .lower-text.left .label').fadeOut(0);
                $('.ldl .lower-text.left .cond').fadeOut(0);
                displayLDL(idx);
            },ldlDelay);
        },
        localAdSales(){
            if(appearanceSettings.ldlType == 'observations') return;
            if(appearanceSettings.ldlType == 'both' && slideSettings.flavor != 'M') return;
            if(appearanceSettings.graphicsPackage == "v1") return;
            clearInterval(ldlInterval);
            $('.ldl .upper-text').fadeOut(0);
            $('.ldl .lower-text').fadeOut(0);
            adCrawl();
        }
    }

    var ldlFuncs = Object.keys(displays);
    var ldlFunc = displays[ldlFuncs[idx]];
    idx = (++idx===ldlFuncs.length ? 0 : idx);
    ldlIdx = idx;
    ldlFunc();
}