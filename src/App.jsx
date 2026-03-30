import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import TamilNaduTicker from './components/TamilNaduTicker';

import { Navigation } from 'lucide-react';

const API_BASE_URL = "https://weather-map-website-backend.onrender.com";

function App() {
    const [activeLayer, setActiveLayer] = useState('standard');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [aqiData, setAqiData] = useState(null);

    const [mapCenter, setMapCenter] = useState(() => {
        const saved = localStorage.getItem('lastLocation');
        return saved ? JSON.parse(saved) : [7.991, 80.883];
    });

    const [locationStatus, setLocationStatus] = useState('prompt'); // prompt, granted, denied, error
    const [isSearching, setIsSearching] = useState(false);

    const updateLocation = (lat, lon) => {
        const newCoords = [lat, lon];
        setMapCenter(newCoords);
        localStorage.setItem('lastLocation', JSON.stringify(newCoords));
    };

    const fetchAllData = async (lat, lon) => {
        setIsSearching(true);
        try {
            // Fetch Current Weather
            const weatherRes = await fetch(`${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
            const weatherData = await weatherRes.json();

            // Fetch Forecast
            const forecastRes = await fetch(`${API_BASE_URL}/api/weather/forecast?lat=${lat}&lon=${lon}`);
            const forecastData = await forecastRes.json();

            // Fetch AQI
            const aqiRes = await fetch(`${API_BASE_URL}/api/weather/aqi?lat=${lat}&lon=${lon}`);
            const aqiData = await aqiRes.json();

            if (weatherRes.ok) {
                setWeatherData(weatherData);
                setForecastData(forecastRes.ok ? forecastData : null);
                setAqiData(aqiRes.ok ? aqiData : null);
            } else {
                setWeatherData({ error: weatherData.message || "Failed to fetch weather" });
            }
        } catch (err) {
            console.error("Data fetch error:", err);
            setWeatherData({ error: "Network error. Please try again." });
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocate = async (isInitial = false) => {
        if (!("geolocation" in navigator)) {
            setLocationStatus('error');
            if (isInitial) fetchAllData(mapCenter[0], mapCenter[1]);
            return;
        }

        setIsSearching(true);

        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setLocationStatus(result.state);

                if (result.state === 'denied') {
                    if (isInitial) fetchAllData(mapCenter[0], mapCenter[1]);
                    setIsSearching(false);
                    return;
                }

                result.onchange = () => {
                    setLocationStatus(result.state);
                    if (result.state === 'granted') handleLocate(false);
                };
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationStatus('granted');
                    updateLocation(latitude, longitude);
                    fetchAllData(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation Error:", error.message);
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationStatus('denied');
                    } else {
                        setLocationStatus('error');
                    }
                    // On initial load error, use fallback but don't clear persistence
                    if (isInitial) fetchAllData(mapCenter[0], mapCenter[1]);
                    setIsSearching(false);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } catch (err) {
            console.error("HandleLocate failed:", err);
            if (isInitial) fetchAllData(mapCenter[0], mapCenter[1]);
            setIsSearching(false);
        }
    };

    const handleSearch = async (city) => {
        setIsSearching(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/weather/search?city=${city}`);
            const data = await response.json();
            if (response.ok) {
                setWeatherData(data);
                if (data.coord) {
                    updateLocation(data.coord.lat, data.coord.lon);
                    fetchAllData(data.coord.lat, data.coord.lon);
                }
            } else {
                setWeatherData({ error: data.message || "City not found" });
            }
        } catch (err) {
            console.error("Search failed:", err);
            setWeatherData({ error: "Network error during search." });
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        handleLocate(true);
    }, []);

    return (
        <div className="app-container">
            <Sidebar
                onSearch={handleSearch}
                weatherData={weatherData}
                forecastData={forecastData}
                aqiData={aqiData}
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
                locationStatus={locationStatus}
                onLocate={() => handleLocate(false)}
                isSearching={isSearching}
            />
            <div className="map-shell">
                <MapView
                    activeLayer={activeLayer}
                    center={mapCenter}
                />
            </div>

            <TamilNaduTicker apiBaseUrl={API_BASE_URL} />

            <button
                className={`locate-fab ${isSearching ? 'is-busy' : ''}`}
                onClick={() => handleLocate(false)}
                title="Detect my location"
                aria-label="Detect my location"
                disabled={isSearching}
            >
                <Navigation
                    size={22}
                    fill="currentColor"
                    style={{ animation: isSearching ? 'spin 2s linear infinite' : 'none' }}
                />
            </button>
        </div>
    );
}

export default App;
