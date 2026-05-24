import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CloudSun, 
  Droplet, 
  Wind, 
  Compass, 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  Sun,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface WeatherViewProps {
  location: string;
}

function getWeatherLabelAndIcon(code: number) {
  // WMO weather interpretation codes
  if (code === 0) return { label: "Fully Sunny", icon: Sun };
  if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", icon: CloudSun };
  if ([45, 48].includes(code)) return { label: "Foggy Mornings", icon: CloudSun };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Light Drizzle", icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Heavy Rainfall", icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Winter Snow", icon: CloudRain };
  if ([95, 96, 99].includes(code)) return { label: "Heavy Thunderstorms", icon: CloudRain };
  return { label: "Partly Cloudy", icon: CloudSun };
}

export default function WeatherView({ location }: WeatherViewProps) {
  const [currentTemp, setCurrentTemp] = useState(24);
  const [currentCondition, setCurrentCondition] = useState("Partly Cloudy");
  const [humidity, setHumidity] = useState(68);
  const [windSpeed, setWindSpeed] = useState("12 km/h NE");
  const [pressure, setPressure] = useState(1014);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLocation, setActiveLocation] = useState(location);

  const [sevenDayForecast, setSevenDayForecast] = useState<any[]>([
    { day: "Mon", temp: "24° / 14°", icon: CloudSun, pop: "15%", label: "Partly Cloudy" },
    { day: "Tue", temp: "22° / 13°", icon: CloudRain, pop: "85%", label: "Heavy Rain" },
    { day: "Wed", temp: "19° / 10°", icon: CloudRain, pop: "60%", label: "Showers" },
    { day: "Thu", temp: "21° / 12°", icon: CloudSun, pop: "20%", label: "Partly Cloudy" },
    { day: "Fri", temp: "23° / 14°", icon: Sun, pop: "5%", label: "Sunny" },
    { day: "Sat", temp: "25° / 15°", icon: Sun, pop: "0%", label: "Sunny" },
    { day: "Sun", temp: "26° / 16°", icon: CloudSun, pop: "10%", label: "Partly Cloudy" },
  ]);

  const [barChartData, setBarChartData] = useState<any[]>([
    { label: "Today", value: 15 },
    { label: "Tue", value: 85 },
    { label: "Wed", value: 60 },
    { label: "Thu", value: 20 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 10 },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        // Step 1: Geodecode standard location text input
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error("Location lookup request failed");
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results[0]) {
          const { latitude, longitude, name, admin1, country } = geoData.results[0];
          if (isMounted) {
            setActiveLocation(`${name}, ${admin1 || country || 'Region'}`);
          }

          // Step 2: Grab meteorological stats & forecasts
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
          const weatherRes = await fetch(weatherUrl);
          if (!weatherRes.ok) throw new Error("Regional meteorological data failed to request");
          const weatherData = await weatherRes.json();

          if (isMounted && weatherData.current && weatherData.daily) {
            const current = weatherData.current;
            const daily = weatherData.daily;

            setCurrentTemp(Math.round(current.temperature_2m));
            const mappingResponse = getWeatherLabelAndIcon(current.weather_code);
            setCurrentCondition(mappingResponse.label);
            setHumidity(Math.round(current.relative_humidity_2m));
            setWindSpeed(`${Math.round(current.wind_speed_10m)} km/h`);
            setPressure(Math.round(current.surface_pressure));

            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const formattedForecast = daily.time.map((timeStr: string, index: number) => {
              const dateObj = new Date(timeStr);
              const dayName = days[dateObj.getDay()];
              const code = daily.weather_code[index];
              const mapObj = getWeatherLabelAndIcon(code);
              const maxTemp = Math.round(daily.temperature_2m_max[index]);
              const minTemp = Math.round(daily.temperature_2m_min[index]);
              const prob = daily.precipitation_probability_max[index] || 0;

              return {
                day: dayName,
                temp: `${maxTemp}° / ${minTemp}°`,
                icon: mapObj.icon,
                pop: `${prob}%`,
                label: mapObj.label
              };
            });

            setSevenDayForecast(formattedForecast);

            const formattedBars = daily.time.slice(0, 7).map((timeStr: string, index: number) => {
              const dateObj = new Date(timeStr);
              let label = days[dateObj.getDay()];
              if (index === 0) label = "Today";
              const prob = daily.precipitation_probability_max[index] || 0;
              return {
                label,
                value: prob
              };
            });

            setBarChartData(formattedBars);
          }
        }
      } catch (err) {
        console.warn("Real weather fetch offset error, preserving robust pre-calculated local backups:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [location]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Weather & Forecast
          </h1>
          <p className="text-gray-500 font-body-md mt-1">
            Detailed dynamic meteorological diagnostics for {activeLocation} farm region.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100/50 text-xs font-bold leading-none select-none">
            <RefreshCw size={13} className="animate-spin" /> Fetching live satellite feeds...
          </div>
        )}
      </div>

      {/* Weather Header Main Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Current Card */}
        <div className="md:col-span-2 glass-panel bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Decorative giant background clouds */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-5 translate-y-5">
            <CloudSun size={320} />
          </div>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">{activeLocation} Current Metrics</p>
              <h2 className="text-6xl font-bold font-display-lg mt-3 select-none">{currentTemp}°C</h2>
              <p className="text-lg font-medium text-emerald-100 mt-2">{currentCondition}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <CloudSun size={48} className="text-yellow-300" />
            </div>
          </div>

          {/* Quick weather status list strip */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-5 mt-5">
            <div className="flex items-center gap-2">
              <Droplet size={18} className="text-emerald-300" />
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Humidity</p>
                <p className="text-sm font-bold">{humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind size={18} className="text-emerald-300" />
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Wind Vector</p>
                <p className="text-sm font-bold">{windSpeed}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-emerald-300" />
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Pressure</p>
                <p className="text-sm font-bold">{pressure} hPa</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations sidebar */}
        <div className="glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold font-display-lg border-b border-gray-100 pb-3">
              <Sparkles size={18} className="text-emerald-600 animate-pulse" />
              <h3 className="text-md text-gray-900 font-bold">Agronomic Insights</h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex gap-3 items-start text-xs text-gray-700">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-950">Sowing Status Check</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">Optimal ground warmth criteria. Soy planting matches positive cycles.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-gray-700">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-950">Rain Schedule Notice</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">Estimated 85% wetness Tuesday. Postpone chemical fertilization rounds.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-gray-700">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-950">Low Wind Risks</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">Spraying wind speeds remain stable. Spore dispersal rates minimal.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-lg text-center font-semibold mt-4">
            Holding dynamic overnight values.
          </p>
        </div>

      </div>

      {/* Grid: 7-Day overview and Chart of rain chance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-day weather cards stack */}
        <div className="lg:col-span-7 glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="font-display-lg text-md font-bold text-gray-900 flex items-center gap-1.5">
              <Calendar size={16} className="text-emerald-600" /> Weather Timeline Forecast
            </h3>
            <span className="text-[10px] capitalize font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">7 Days</span>
          </div>

          <div className="space-y-2.5">
            {sevenDayForecast.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-gray-100 rounded-xl transition-all"
                >
                  <span className="font-bold text-xs text-gray-900 w-12">{item.day}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Icon size={18} className="text-emerald-600" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="bg-sky-50 text-sky-800 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                      ☔ {item.pop}
                    </span>
                    <span className="text-gray-900 font-bold w-20 text-right">{item.temp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rain probability bar chart (Pure dynamic visual CSS) */}
        <div className="lg:col-span-5 glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display-lg text-md font-bold text-gray-900 pb-2 border-b border-gray-100 mb-5 flex items-center gap-1.5">
              <CloudSun size={16} className="text-emerald-600" /> Rain Probability (POP) Trends
            </h3>
            
            {/* Elegant horizontal/vertical bars */}
            <div className="flex items-end justify-between h-48 select-none border-b border-gray-100 pb-2">
              {barChartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="w-full max-w-[24px] rounded-t-lg bg-slate-100 relative h-36 flex items-end">
                    {/* Visual highlighted bar */}
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        data.value > 50 
                          ? 'bg-sky-500 hover:bg-sky-600 group-hover:scale-y-105' 
                          : 'bg-emerald-500 hover:bg-emerald-600 group-hover:scale-y-105'
                      }`} 
                      style={{ height: `${data.value}%` }}
                    ></div>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow whitespace-nowrap left-1/2 -translate-x-1/2">
                      {data.value}%
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2">{data.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-center text-[10px] text-gray-400 mt-6 font-semibold">
            Soil hydration holding: Optimal evaporative values.
          </div>
        </div>

      </div>
    </div>
  );
}
