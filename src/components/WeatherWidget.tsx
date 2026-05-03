import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Thermometer, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get weather from Open-Meteo
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`
          );
          const weatherData = await weatherRes.json();

          // Get location name from OSM Nominatim (reverse geocoding)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const locationName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.suburb || "Remote Area";

          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            condition: getWeatherCondition(weatherData.current_weather.weathercode),
            humidity: weatherData.hourly.relativehumidity_2m[0],
            windSpeed: weatherData.current_weather.windspeed,
            locationName
          });
        } catch (err) {
          console.error("Weather fetch failed:", err);
          setError("Neural link to weather satellite failed");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Access to biometric location denied");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const WeatherIcon = ({ condition }: { condition: string }) => {
    switch (condition) {
      case 'Clear': return <Sun className="text-amber-500" />;
      case 'Partly Cloudy': return <Cloud className="text-blue-400" />;
      case 'Rainy': case 'Rain Showers': return <CloudRain className="text-blue-600" />;
      case 'Thunderstorm': return <CloudLightning className="text-purple-600" />;
      default: return <Cloud className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Wind size={14} className="text-blue-500" />
          Environmental Matrix
        </h4>
        {weather && (
          <button 
            onClick={fetchWeather}
            className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
          >
            Resync
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
            <span className="text-[10px] font-black text-slate-400 uppercase">Synchronizing Satellites...</span>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <AlertCircle className="text-rose-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button 
              onClick={fetchWeather}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white"
            >
              Retry Access
            </button>
          </motion.div>
        ) : weather ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                  <MapPin size={12} className="text-rose-500" />
                  <span className="text-xs font-black uppercase truncate max-w-[150px]">{weather.locationName}</span>
                </div>
                <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-1">
                  {weather.temp}
                  <span className="text-xl">°C</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{weather.condition}</p>
              </div>
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center scale-110">
                <WeatherIcon condition={weather.condition} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Thermometer size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Humidity</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Wind size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Wind</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-[9px] font-bold text-blue-700 dark:text-blue-400 leading-tight">
                {weather.temp > 30 
                  ? "Neural Alert: High hydration required. Avoid external exertion." 
                  : weather.temp < 15 
                    ? "Neural Alert: Thermal optimization required. Boost immune system."
                    : "Environmental parameters optimal for cognitive performance."}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Decorative pulse */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Link</span>
      </div>
    </div>
  );
};
