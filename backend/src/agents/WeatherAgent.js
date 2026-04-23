export const WeatherAgent = {
  name: "WeatherAgent",
  description: "Gets current weather for any city",

  async run(city) {
    const start = Date.now();
    try {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`
      );
      const data = await res.json();
      const c = data.current_condition[0];
      const area = data.nearest_area[0];

      return {
        agent: "WeatherAgent",
        success: true,
        result: {
          city: `${area.areaName[0].value}, ${area.country[0].value}`,
          temp_c: c.temp_C,
          feels_like: c.FeelsLikeC,
          condition: c.weatherDesc[0].value,
          humidity: c.humidity,
          wind_kmph: c.windspeedKmph,
        },
        ms: Date.now() - start,
      };
    } catch (err) {
      return {
        agent: "WeatherAgent",
        success: false,
        error: err.message,
        ms: Date.now() - start,
      };
    }
  },
};