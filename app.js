let localDateAndTime = new Date();
let myCountry = "Sri Lanka";
// for history
let lastSevenDays = [];

let DEFAULT_LATITUDE = 6.93; 
let DEFAULT_LONGITUDE = 79.85;


for (let i = 1; i < 7; i++) {
    let currentDate = new Date(localDateAndTime);
    currentDate.setDate(localDateAndTime.getDate() - i);
    let date = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
    lastSevenDays.push(date);
}
// ..........................
function displayDateTime() {
    let dateString = localDateAndTime.toLocaleDateString('en-US');
    let timeString = localDateAndTime.toLocaleTimeString('en-US');
    document.getElementById("timeSection").innerText = timeString;
    document.getElementById("dateSection").innerText = dateString;
}
setInterval(function () {
    if (localDateAndTime) {
        localDateAndTime.setSeconds(localDateAndTime.getSeconds() + 1);
        displayDateTime();
    }
}, 1000);
getLocation();
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("loadingN").style.display = "none";
        document.getElementById("name").innerHTML = "Location is not supported by this browser.";
    }
}

function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    findDetailsThroughLatAndLon(latitude, longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            var option = confirm("Location permission denied from system. Do you want to set default location? select [OK]");
            if (option == true) {
                // Set default location
                findDetailsThroughLatAndLon(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
            } else {
                // Retry
                getLocation();
            }
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("name").innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById("name").innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("name").innerHTML = "An unknown error occurred.";
            break;
    }
}


let tempC;
let tempF;
let temp = document.getElementById("temp")
let inputFiled = document.getElementById('searchInput');
let weatherArray = [];
function findDetailsThroughLatAndLon(latitude, longitude) {
    document.getElementById("moreContainer").style.display = "none";
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=eed2846bcaa64ab2bdf40121241003&q=${latitude},${longitude}&days=7`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loadingN").style.display = "none";
            document.getElementById("name").innerHTML = data["location"]["name"];
            document.getElementById("loadingT").style.display = "none";
            document.getElementById("bS").style.display = "block";
            tempC = data["current"]["temp_c"];
            tempF = data["current"]["temp_f"];
            temp.innerHTML = tempC
            document.getElementById("loadingCl").style.display = "none";
            document.getElementById("cloudy").innerHTML = data["current"]["condition"]["text"];
            document.getElementById("loadingI").style.display = "none";
            document.getElementById("img").src = data["current"]["condition"]["icon"];
            let country = data["location"]["country"];
            // shBar
            document.getElementById("shLocation").innerHTML = data["location"]["tz_id"];
            document.getElementById("shTemp").innerHTML = tempC + "&deg;C";
            document.getElementById("shHum").innerHTML = data["current"]["humidity"] + "%";
            document.getElementById("shWSpeed").innerHTML = data["current"]["wind_kph"] + " km/h";
            document.getElementById("shRegion").innerHTML = data["location"]["region"];
            document.getElementById("shCou").innerHTML = data["location"]["country"];
            document.getElementById("shLat").innerHTML = data["location"]["lat"];
            document.getElementById("shLon").innerHTML = data["location"]["lon"];
            document.getElementById("shCon").innerHTML = data["current"]["condition"]["text"];
            if (myCountry != country) {
                localDateAndTime = new Date(data["location"]["localtime"]);
            } else {
                localDateAndTime = new Date();
            }
            displayDateTime();
            if (inputFiled.value != '') {
                inputFiled.value = data["location"]["name"];
            }

            //sFos
            let i = 0;
            weatherArray = [];
            data["forecast"]["forecastday"].forEach(element => {
                let date = element["date"];
                let maxTempC = element["day"]["maxtemp_c"];
                let maxTempF = element["day"]["maxtemp_f"];
                let minTempC = element["day"]["mintemp_c"];
                let minTempF = element["day"]["mintemp_f"];
                let maxWind = element["day"]["maxwind_kph"];
                let totalPre = element["day"]["totalprecip_mm"];
                let averageHum = element["day"]["avghumidity"];
                let rainPos = element["day"]["daily_chance_of_rain"];
                let sunrise = element["astro"]["sunrise"];
                let sunset = element["astro"]["sunset"];
                let moonrise = element["astro"]["moonrise"];
                let moonset = element["astro"]["moonset"];
                let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date };
                weatherArray.push(weatherData);
                if (i == 0) {
                    document.getElementById("timeSection").innerText = element["date"];
                }
                if (i > 0) {
                    if (i == 1) {
                        document.getElementById("fStart").innerHTML = "To : " + element["date"];
                    } else if (i == 6) {
                        document.getElementById("fEnd").innerHTML = "End : " + element["date"];
                    }
                    let day = `day${i}`;
                    let dayI = day + "I";
                    let dayC = day + "C";
                    let dayBtn = day + "Btn";
                    let dayDC = day + "DC";
                    let dayIC = day + "IC";
                    let dayCC = day + "CC";

                    document.getElementById(dayDC).classList.remove('skeleton');
                    document.getElementById(dayIC).classList.remove('skeleton');
                    document.getElementById(dayCC).classList.remove('skeleton');
                    document.getElementById(day).innerHTML = date;
                    document.getElementById(dayI).src = element["day"]["condition"]["icon"];
                    document.getElementById(dayC).innerHTML = element["day"]["condition"]["text"];
                    document.getElementById(dayBtn).innerHTML = `
    <a href="#moreContainer" class="w-100 rounded-1 btn btn-outline-dark" onclick="showMore(${i})">
        More...
    </a>`;
                }
                i++;
            });
        })
        .then(error => console.log(error));
    initializeMap(latitude, longitude);
    setWeatherHistory(latitude, longitude);
}

document.getElementById("btnF").addEventListener("click", function () {
    let btnC = document.getElementById("btnC");
    let dTemp = "\u00B0C";
    if (btnC.innerHTML == dTemp) {
        if (temp.innerHTML != '') {
            temp.innerHTML = tempF;
            document.getElementById("shTemp").innerHTML = tempF + "&deg;F";
        }
        btnC.innerHTML = "&deg;F"
        btnF.innerHTML = "&deg;C"
    } else {
        if (temp.innerHTML != '') {
            temp.innerHTML = tempC;
            document.getElementById("shTemp").innerHTML = tempC + "&deg;C";
        }
        btnF.innerHTML = "&deg;F"
        btnC.innerHTML = "&deg;C"
    }
});
let suggestionsList = document.getElementById('suggestions');
let nameS;
let countryS;
function showSuggestions() {
    const input = inputFiled.value.toLowerCase();
    suggestionsList.innerHTML = '';
    let sug = '';
    if (input != "") {
        fetch(`https://api.weatherapi.com/v1/search.json?key=eed2846bcaa64ab2bdf40121241003&q=${input}`)
            .then(response => response.json())
            .then(data => {
                if (data.length == 0) {
                    if (input.length <= 2) {
                        suggestionsList.innerHTML = `<button class="list-group-item list-group-item-action">
                                                        <h5 class="mb-1"></h5>
                                                        <p class="mb-1">Enter More Letters...</p>
                                                    </button>`;
                    } else {
                        suggestionsList.innerHTML = `<button class="list-group-item list-group-item-action">
                                                        <h5 class="mb-1"></h5>
                                                        <p class="mb-1">Can't Found...</p>
                                                    </button>`;
                    }

                } else {
                    let i = 0;
                    data.forEach(element => {
                        i++;
                        nameS = element["name"];
                        countryS = element["country"];
                        sug += `<button class="list-group-item list-group-item-action" onclick="findDetailsThroughLatAndLon(${element["lat"]},${element["lon"]})">
                                    <h5 class="mb-1">${nameS}</h5>
                                    <p class="mb-1">${countryS}</p>
                                </button>`
                    });
                    suggestionsList.innerHTML = sug;
                }
            })
            .then(error => console.log(error));
    } else {
        suggestionsList.innerHTML = '';
    }
}
document.getElementById("sBtn").addEventListener("click", () => {
    document.getElementById("moreContainer").style.display = "none";
    let name = inputFiled.value;
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=eed2846bcaa64ab2bdf40121241003&q=${name}&days=7`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loadingN").style.display = "none";
            document.getElementById("name").innerHTML = data["location"]["name"];
            document.getElementById("loadingT").style.display = "none";
            document.getElementById("bS").style.display = "block";
            tempC = data["current"]["temp_c"];
            tempF = data["current"]["temp_f"];
            temp.innerHTML = tempC
            document.getElementById("loadingCl").style.display = "none";
            document.getElementById("cloudy").innerHTML = data["current"]["condition"]["text"];
            document.getElementById("loadingI").style.display = "none";
            document.getElementById("img").src = data["current"]["condition"]["icon"];
            let country = data["location"]["country"];
            // shBar

            document.getElementById("shLocation").innerHTML = data["location"]["tz_id"];
            document.getElementById("shTemp").innerHTML = tempC + "&deg;C";
            document.getElementById("shHum").innerHTML = data["current"]["humidity"] + "%";
            document.getElementById("shWSpeed").innerHTML = data["current"]["wind_kph"] + " km/h";
            document.getElementById("shRegion").innerHTML = data["location"]["region"];
            document.getElementById("shCou").innerHTML = data["location"]["country"];
            initializeMap(data["location"]["lat"], data["location"]["lon"]);
            setWeatherHistory(data["location"]["lat"], data["location"]["lon"]);
            document.getElementById("shLat").innerHTML = data["location"]["lat"];
            document.getElementById("shLon").innerHTML = data["location"]["lon"];
            document.getElementById("shCon").innerHTML = data["current"]["condition"]["text"];
            if (myCountry != country) {
                localDateAndTime = new Date(data["location"]["localtime"]);
            } else {
                localDateAndTime = new Date();
            }
            displayDateTime();
            if (inputFiled.value != '') {
                inputFiled.value = data["location"]["name"];
            }

            //sFos

            let i = 0;
            weatherArray = [];
            data["forecast"]["forecastday"].forEach(element => {
                let date = element["date"];
                let maxTempC = element["day"]["maxtemp_c"];
                let maxTempF = element["day"]["maxtemp_f"];
                let minTempC = element["day"]["mintemp_c"];
                let minTempF = element["day"]["mintemp_f"];
                let maxWind = element["day"]["maxwind_kph"];
                let totalPre = element["day"]["totalprecip_mm"];
                let averageHum = element["day"]["avghumidity"];
                let rainPos = element["day"]["daily_chance_of_rain"];
                let sunrise = element["astro"]["sunrise"];
                let sunset = element["astro"]["sunset"];
                let moonrise = element["astro"]["moonrise"];
                let moonset = element["astro"]["moonset"];
                let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date };
                weatherArray.push(weatherData);
                if (i == 0) {
                    document.getElementById("timeSection").innerText = element["date"];
                }
                if (i > 0) {
                    if (i == 1) {
                        document.getElementById("fStart").innerHTML = "To : " + element["date"];
                    } else if (i == 6) {
                        document.getElementById("fEnd").innerHTML = "End : " + element["date"];
                    }
                    let day = `day${i}`;
                    let dayI = day + "I";
                    let dayC = day + "C";
                    let dayBtn = day + "Btn";
                    let dayDC = day + "DC";
                    let dayIC = day + "IC";
                    let dayCC = day + "CC";

                    document.getElementById(dayDC).classList.remove('skeleton');
                    document.getElementById(dayIC).classList.remove('skeleton');
                    document.getElementById(dayCC).classList.remove('skeleton');
                    document.getElementById(day).innerHTML = date;
                    document.getElementById(dayI).src = element["day"]["condition"]["icon"];
                    document.getElementById(dayC).innerHTML = element["day"]["condition"]["text"];
                    document.getElementById(dayBtn).innerHTML = `
    <a href="#moreContainer" class="w-100 rounded-1 btn btn-outline-dark" onclick="showMore(${i})">
        More...
    </a>`;
                }
                i++;
            });
        })
        .then(error => console.log(error))
});
document.body.addEventListener('click', () => {
    if (suggestionsList != "") {
        suggestionsList.innerHTML = '';
    }
});

function showMore(index) {
    if (weatherArray.length != 0) {
        document.getElementById("moreContainer").style.display = "block";
        let i = 0;
        weatherArray.forEach(element => {
            if (i == index) {
                document.getElementById("moreDate").innerHTML = "Date: " + element["date"];
                document.getElementById("moreMaxTemp").innerHTML = element["maxTempC"] + "&deg;C / " + element["maxTempF"] + "&deg;F";
                document.getElementById("moreLowTemp").innerHTML = element["minTempC"] + "&deg;C / " + element["minTempF"] + "&deg;F";
                document.getElementById("moreMaxWind").innerHTML = element["maxWind"] + " km/h";
                document.getElementById("morePre").innerHTML = element["totalPre"] + " mm";
                document.getElementById("moreAVGH").innerHTML = element["averageHum"] + "%";
                document.getElementById("moreRain").innerHTML = element["rainPos"] + "%";
                document.getElementById("moreSunR").innerHTML = element["sunrise"];
                document.getElementById("moreSunS").innerHTML = element["sunset"];
                document.getElementById("moreMoonR").innerHTML = element["moonrise"];
                document.getElementById("moreMoonS").innerHTML = element["moonset"];
            }
            i++;
        });
    } else {
        alert("Set Location First");
    }
}
function hideMore() {
    document.getElementById("moreContainer").style.display = "none";
}
function hideHMore() {
    document.getElementById("HmoreContainer").style.display = "none";
}

var map;
function initializeMap(latitude, longitude) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([latitude, longitude], 13); // Set initial coordinates and zoom level
    document.getElementById("mapC").classList.remove('skeleton');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var marker = L.marker([latitude, longitude]).addTo(map); // Add a marker at specified coordinates
}
weatherHistoryArray = [];
function setWeatherHistory(lat, lon) {
    weatherHistoryArray = [];
    // let isDataSet = true;
    // for (let i = 0; i < 7;) {
    //     if (isDataSet) {
    //         isDataSet = false;
    //         let date = lastSevenDays[i];
    //         if (i == 0) {
    //             document.getElementById("hStart").innerHTML = "To : " + date;
    //         } else if (i == 5) {
    //             document.getElementById("hEnd").innerHTML = "End : " + date;
    //         }
    //         fetch(`http://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date}`)
    //             .then(response => response.json())
    //             .then(data => {
    //                 //sHis
    //                 console.log(i);
    //                 let element = data["forecast"]["forecastday"][0];
    //                 let date = element["date"];
    //                 let maxTempC = element["day"]["maxtemp_c"];
    //                 let maxTempF = element["day"]["maxtemp_f"];
    //                 let minTempC = element["day"]["mintemp_c"];
    //                 let minTempF = element["day"]["mintemp_f"];
    //                 let maxWind = element["day"]["maxwind_kph"];
    //                 let totalPre = element["day"]["totalprecip_mm"];
    //                 let averageHum = element["day"]["avghumidity"];
    //                 let rainPos = element["day"]["daily_chance_of_rain"];
    //                 let sunrise = element["astro"]["sunrise"];
    //                 let sunset = element["astro"]["sunset"];
    //                 let moonrise = element["astro"]["moonrise"];
    //                 let moonset = element["astro"]["moonset"];
    //                 let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date };
    //                 weatherHistoryArray.push(weatherData);
    //                 isDataSet = true;
    //                 i++;
    //             }).then(error => console.log(error));
    //     }
    // }
    let date1 = lastSevenDays[0];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date1}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
    let date2 = lastSevenDays[1];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date2}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
    let date3 = lastSevenDays[2];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date3}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
    let date4 = lastSevenDays[3];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date4}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
    let date5 = lastSevenDays[4];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date5}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
    let date6 = lastSevenDays[5];
    fetch(`https://api.weatherapi.com/v1/history.json?key=eed2846bcaa64ab2bdf40121241003&q=${lat},${lon}&dt=${date6}`)
        .then(response => response.json())
        .then(data => {
            //sHis
            let element = data["forecast"]["forecastday"][0];
            let date = element["date"];
            let icon = element["day"]["condition"]["icon"];
            let condition = element["day"]["condition"]["text"];
            let maxTempC = element["day"]["maxtemp_c"];
            let maxTempF = element["day"]["maxtemp_f"];
            let minTempC = element["day"]["mintemp_c"];
            let minTempF = element["day"]["mintemp_f"];
            let maxWind = element["day"]["maxwind_kph"];
            let totalPre = element["day"]["totalprecip_mm"];
            let averageHum = element["day"]["avghumidity"];
            let rainPos = element["day"]["daily_chance_of_rain"];
            let sunrise = element["astro"]["sunrise"];
            let sunset = element["astro"]["sunset"];
            let moonrise = element["astro"]["moonrise"];
            let moonset = element["astro"]["moonset"];
            let weatherData = { maxTempC, maxTempF, minTempC, minTempF, maxWind, totalPre, averageHum, rainPos, sunrise, sunset, moonrise, moonset, date, icon, condition };
            weatherHistoryArray.push(weatherData);
            showWeatherHistory();
        }).then(error => console.log(error));
}
function showWeatherHistory() {
    if (weatherHistoryArray.length == 6) {
        let i = 0;
        lastSevenDays.forEach(day => {
            let lDate = new Date(day);
            lDate = lDate.toLocaleDateString('en-US');
            weatherHistoryArray.forEach(element => {
                let wDate = new Date(element["date"]);
                wDate = wDate.toLocaleDateString('en-US');
                if (lDate == wDate) {
                    if (i == 0) {
                        document.getElementById("hStart").innerHTML = "To : " + element["date"];
                    } else if (i == 5) {
                        document.getElementById("hEnd").innerHTML = "End : " + element["date"];
                    }
                    let day = `Hday${i + 1}`;
                    let dayI = day + "I";
                    let dayC = day + "C";
                    let dayBtn = day + "Btn";
                    let dayDC = day + "DC";
                    let dayIC = day + "IC";
                    let dayCC = day + "CC";

                    document.getElementById(dayDC).classList.remove('skeleton');
                    document.getElementById(dayIC).classList.remove('skeleton');
                    document.getElementById(dayCC).classList.remove('skeleton');
                    document.getElementById(day).innerHTML = element["date"];
                    document.getElementById(dayI).src = element["icon"]
                    document.getElementById(dayC).innerHTML = element["condition"]
                    document.getElementById(dayBtn).innerHTML = `<a href="#HmoreContainer" class="w-100 rounded-1 btn btn-outline-dark" onclick="showHMore(${i})">More...</a>`;

                }
            });
            i++;
        });
    }
}

function showHMore(index) {
    document.getElementById("HmoreContainer").style.display = "block";
    let i = 0;
    let selectedDate = new Date(lastSevenDays[index]);
    selectedDate = selectedDate.toLocaleDateString('en-US');
    weatherHistoryArray.forEach(element => {
        let sDateH = new Date(element["date"]);
        sDateH = sDateH.toLocaleDateString('en-US');
        if (selectedDate == sDateH) {
            document.getElementById("HmoreDate").innerHTML = "Date: " + element["date"];
            document.getElementById("HmoreMaxTemp").innerHTML = element["maxTempC"] + "&deg;C / " + element["maxTempF"] + "&deg;F";
            document.getElementById("HmoreLowTemp").innerHTML = element["minTempC"] + "&deg;C / " + element["minTempF"] + "&deg;F";
            document.getElementById("HmoreMaxWind").innerHTML = element["maxWind"] + " km/h";
            document.getElementById("HmorePre").innerHTML = element["totalPre"] + " mm";
            document.getElementById("HmoreAVGH").innerHTML = element["averageHum"] + "%";
            document.getElementById("HmoreRain").innerHTML = element["rainPos"] + "%";
            document.getElementById("HmoreSunR").innerHTML = element["sunrise"];
            document.getElementById("HmoreSunS").innerHTML = element["sunset"];
            document.getElementById("HmoreMoonR").innerHTML = element["moonrise"];
            document.getElementById("HmoreMoonS").innerHTML = element["moonset"];
        }
    });
}