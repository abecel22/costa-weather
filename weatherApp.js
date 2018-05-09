var latitude;
var longitude;
var coordinates;
var weatherText;

// window.onload = function() {
//     geoFindMe();
// };

//geoFindme is check for coordinates
function geoFindMe() {
    if (!navigator.geolocation) {
        $('#dispCity').text('Unable to retrieve your location');
        $('#dispTemp').text('Turn on location or search below');
        searchCity();
    }

    function success(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        coordinates = latitude + ',' + longitude;
        init();
    }

    function error() {
        $('#dispCity').text('Unable to retrieve your location');
        $('#dispTemp').text('Turn on location or search below');
        searchCity();
    }

    navigator.geolocation.getCurrentPosition(success, error);
}

//init afte coordinates are received from user
function init() {
    // uses the coordinates on the weatherUnderground API URL

    var urlFromIP =
        'https://api.wunderground.com/api/d26f80d16a35b851/geolookup/conditions/q/' +
        coordinates +
        '.json';
    $(document).ready(function() {
        var locationName;
        var TempF;
        var windMiles;
        var windDir;
        var humidity;

        //wUnderground api function
        function getWeather() {
            $.ajax({
                url: urlFromIP,
                dataType: 'jsonp',
                success: function(parsed_json) {
                    locationName = parsed_json.location.city;
                    tempF = parsed_json.current_observation.temp_f.toFixed();
                    tempC = parsed_json.current_observation.temp_c.toFixed();
                    humidity =
                        parsed_json.current_observation.relative_humidity;
                    weatherText = parsed_json.current_observation.weather;
                    $('#dispCity').text(locationName);
                    $('#dispTemp').text(tempF + '°');
                    $('#dispHumi').text('Humidity ' + humidity);
                    $('#dispWeatherText').text(weatherText);
                    changeImage();
                }
            });
        }
        getWeather();
        changeToMetric();

        //change to metric and back
        function changeToMetric() {
            $('#metric').click(function() {
                var unit = $('#metric').text();
                console.log(unit);
                if (unit !== 'Convert to Celcius') {
                    $('#dispTemp').text(tempC + '°');
                    $('#metric').text('Convert to Celcius');
                } else {
                    $('#dispTemp').text(tempF + '°');
                    $('#metric').text('Convert to Farenheit');
                }
            });
        }

        searchCity();
    });
}

//Change background image if not weather is not clear and sunny.
function changeImage() {
    if (weatherText.includes('Cloudy')) {
        $('body').css(
            'background-image',
            "url('https://www.dropbox.com/s/klqz32uwj182swc/partlyCloudy.jpg?raw=1')"
        );
    } else if (weatherText.includes('Rain')) {
        $('body').css(
            'background-image',
            "url('https://www.dropbox.com/s/54gbl3x4v0s7g0c/rain.jpg?raw=1')"
        );
    } else if (weatherText === 'Overcast') {
        $('body').css(
            'background-image',
            "url('https://www.dropbox.com/s/1hutuhwm8hyoeon/overcast.jpg?raw=1')"
        );
    } else if (weatherText.includes('Thunderstorm')) {
        $('body').css(
            'background-image',
            "url('https://www.dropbox.com/s/2j97szsjl8rznlt/thunder.jpg?raw=1')"
        );
    } else if (weatherText === 'Clear') {
        $('body').css(
            'background-image',
            "url('https://www.dropbox.com/s/4tjppcuqzsculsv/clearSky.jpg?raw=1')"
        );
    }
}

//add a autocomplete api
function searchCity() {
    $('#cityNameSearch').keyup(function() {
        var value = $('#cityNameSearch').val();
        var rExp = new RegExp(value, 'i');
        $.getJSON(
            'https://autocomplete.wunderground.com/aq?query=' + value + '&cb=?',
            function(data) {
                // Begin building output
                var output = '<div>';
                $.each(data.RESULTS, function(key, val) {
                    if (val.name.search(rExp) != -1 && key < 11) {
                        output += '<p>';
                        output +=
                            '<a href="#newCity" data-q_id=' +
                            val.zmw +
                            '>' +
                            val.name +
                            '</a>';
                        output += '</p>';
                    }
                    output += '</div>';
                }); // end each
                $('#searchResults').html(output);
                // send results to the page
                $('a').on('click', function(e) {
                    var newCityCode = $(this).data('q_id');

                    urlFromIP =
                        'https://api.wunderground.com/api/d26f80d16a35b851/conditions/q/zmw:' +
                        newCityCode +
                        '.json';
                    function getNewWeather() {
                        $.ajax({
                            url: urlFromIP,
                            dataType: 'jsonp',
                            success: function(parsed_json) {
                                locationName =
                                    parsed_json.current_observation
                                        .display_location.city;
                                tempF = parsed_json.current_observation.temp_f.toFixed();
                                tempC = parsed_json.current_observation.temp_c.toFixed();
                                humidity =
                                    parsed_json.current_observation
                                        .relative_humidity;
                                weatherText =
                                    parsed_json.current_observation.weather;
                                $('#dispCity').text(locationName);
                                $('#dispTemp').text('Temp: ' + tempF + '° F');
                                $('#dispHumi').text('Humidity: ' + humidity);
                                $('#dispWeatherText').text(
                                    'Current Condition: ' + weatherText
                                );
                                changeImage();
                            }
                        });
                    }
                    getNewWeather();
                    $('input')
                        .not(':button, :submit, :reset, :hidden')
                        .val('');
                    $('#searchResults').empty();
                });
            }
        );

        // end getJSON
    }); // end onkeyup
}
