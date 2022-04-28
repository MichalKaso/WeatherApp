import { addHours, addDays, format } from "date-fns";

const weather = (() => {

    //weather conditions
  const findWeatherType = function(id) {
    if(id >= 200 && id < 300) return "Storm";
    if(id >= 300 && id < 400) return "Rain";
    if(id >= 500 && id < 600) return "Rain";
    if(id >= 600 && id < 700) return "Snow";
    if(id >= 700 && id < 800) return "Mist";
    if(id === 800) return "Sun";
    if(id > 800 && id < 900) return "Cloud";
  };

  const formatWeatherData = function(now, dataArray, isHour) {
    return dataArray.map((data, index) => {
      return {
        tempF: Math.ceil(isHour ? data.temp : data.temp.day),
        tempC: Math.ceil(isHour ? (data.temp - 32) * (5 / 9) : (data.temp.day - 32) * (5 / 9)),
        icon: `small${findWeatherType(data.weather[0].id)}`,
        time: isHour ? format(addHours(now, index + 1), "h:00 aa") : format(addDays(now, index + 1), "E")
      };
    });
  };

  //fetch - location
  const getLocation = async function(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
    const data = await response.json();
    return {
      lat: data[0].lat,
      lon: data[0].lon,
      city: data[0].display_name.slice(0, data[0].display_name.indexOf(",") === -1 ? data[0].display_name.length : data[0].display_name.indexOf(","))
    };
  };

  //fetch - weather
  const getWeather = async function(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=c88ef095fba1959850e425433fdde06e`);
    const data = await response.json();
    const now = new Date();
    const hourly = formatWeatherData(now, data.hourly.slice(0, 24), true);
    const weekly = formatWeatherData(now, data.daily.slice(1), false);
    return {
      tempF: Math.ceil(data.current.temp),
      tempC: Math.ceil((data.current.temp - 32) * (5 / 9)),
      icon: `big${findWeatherType(data.current.weather[0].id)}`,
      hourly0: hourly.slice(0, 5),
      hourly1: hourly.slice(5, 10),
      hourly2: hourly.slice(10, 15),
      hourly3: hourly.slice(15, 20),
      hourly4: hourly.slice(20),
      weekly0: weekly.slice(0, 5),
      weekly1: weekly.slice(5)
    };
  };

  const getData = async function(location) {
    const locationData = await getLocation(location);
    const weatherData = await getWeather(locationData.lat, locationData.lon);
    return {
      ...locationData,
      ...weatherData
    };
  }

  return {
    getData
  };

})();

export default weather;