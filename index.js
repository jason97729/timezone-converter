const body = document.getElementById("body");
const head = document.getElementById("head");
const current_time = document.getElementById("current-time");
const originalDateTime = document.getElementById("originalDateTime");
const clearButton = document.getElementById("clear");
const enterButton = document.getElementById("enter");
const infoSection = document.getElementById("info");
let latLng = '';
let url = '';

let originalPlaceTime = {};
let convertPlaceTime = {};
const autocompleteElement =  document.getElementById('autocomplete');
const autocomplete2Element =  document.getElementById('autocomplete2');

const password = prompt("Please enter a password");

if (password === config.password) {
    function updateTime() {
        const now = moment().format('YYYY-MM-DD, h:mm:ss A');
        current_time.textContent = 'Local time : ' + now;
    }
    
    setInterval(updateTime, 1000)
    updateTime()
    
    
    let autocomplete;
    function initAutocomplete() {
        autocomplete = new google.maps.places.Autocomplete(
            autocompleteElement,
            {
                types: ['(cities)'],
                fields: ['place_id', 'geometry', 'name',]
            }
        );
        autocomplete2 = new google.maps.places.Autocomplete(
            autocomplete2Element,
            {
                types: ['(cities)'],
                fields: ['place_id', 'geometry', 'name',]
            }
        );
        autocomplete.addListener('place_changed', function() { onPlaceChanged(autocompleteElement, autocomplete, originalPlaceTime); });
        autocomplete2.addListener('place_changed', function() { onPlaceChanged(autocomplete2Element, autocomplete2, convertPlaceTime); });
    }
    
    function onPlaceChanged(autocompleteElement, autocomplete, dict) {
        var place = autocomplete.getPlace();
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        latLng = lat.toString() + ',' + lng.toString();
        url = 'https://dev.virtualearth.net/REST/v1/timezone/' + latLng + '?key=' + config.bingMapsApi;
    
        if (!place.geometry) {
            // User did not select a prediction; reset the input field
            autocompleteElement.placeholder = 'Enter a place';
        } else {
            dict.place = place.name;
            dict.latLng = latLng;
            dict.url = url;
        }
    }
    
    async function getTimeZone(url, dict) {
        console.log(url);
        console.log(dict);
        await fetch(url).then(response => response.json()).then(data => dict.timezone = data.resourceSets[0].resources[0].timeZone.ianaTimeZoneId);
    }
    
    originalDateTime.flatpickr({enableTime: true,});
    
    function clear() {
        originalDateTime.value = ''
    }
    
    clearButton.addEventListener('click', clear);
    
    function convertTimezone(originalDateTime, originalTimezone, convertPlaceTime) {
        const original = moment.tz(originalDateTime, originalTimezone)
        const convert = original.clone().tz(convertPlaceTime.timezone).format('YYYY-MM-DD, h:mm A');
        convertPlaceTime.dateTime = convert
    }
    
    async function enter() {
        originalPlaceTime.dateTime = originalDateTime.value;
        await getTimeZone(originalPlaceTime.url, originalPlaceTime);
        await getTimeZone(convertPlaceTime.url, convertPlaceTime);
        convertTimezone(originalPlaceTime.dateTime, originalPlaceTime.timezone, convertPlaceTime)
        infoSection.innerHTML=''
        const originalPlaceTimeElement = document.createElement("h3");
        const convertPlaceTimeElement = document.createElement("h3");
        originalPlaceTimeElement.textContent = 'Original Place and Time: '+ originalPlaceTime.place + ', ' + moment(originalPlaceTime.dateTime).format('YYYY-MM-DD, h:mm A');
        convertPlaceTimeElement.textContent = 'Converted Place and Time: '+ convertPlaceTime.place + ', ' + convertPlaceTime.dateTime;
        infoSection.append(originalPlaceTimeElement);
        infoSection.append(convertPlaceTimeElement);
    }
    
    enterButton.addEventListener('click', enter);
    
} else {
    alert('Wrong password!');
    head.innerHTML = "";
    setTimeout(() => {
        head.innerHTML = "";   
    }, 5500)
    body.innerHTML = "";
}



