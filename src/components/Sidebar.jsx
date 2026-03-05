import React, { useState } from 'react';
import {
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Sun,
    Wind,
    Droplets,
    Gauge,
    Eye,
    Sunrise,
    Navigation,
    Search
} from 'lucide-react';
import LocationStatus from './LocationStatus';

const Sidebar = ({ activeLayer, setActiveLayer, weatherData, forecastData, aqiData, onLocate, onSearch, locationStatus, isSearching }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchQuery.trim()) {
                onSearch(searchQuery.trim());
                setSearchQuery('');
            }
        }
    };

    const getAQIDetails = (aqi) => {
        const details = {
            1: { label: 'Excellent', color: '#10b981', desc: 'Air is fresh and clean.' },
            2: { label: 'Good', color: '#84cc16', desc: 'Air quality is acceptable.' },
            3: { label: 'Fair', color: '#f59e0b', desc: 'Moderate pollution present.' },
            4: { label: 'Poor', color: '#ef4444', desc: 'Unhealthy for sensitive groups.' },
            5: { label: 'Very Poor', color: '#991b1b', desc: 'Health alert: everyone affected.' }
        };
        return details[aqi] || details[1];
    };

    const processWeeklyForecast = (list) => {
        if (!list) return [];
        // Group by day and take midday forecast
        const days = {};
        list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!days[date] || item.dt_txt.includes('12:00:00')) {
                days[date] = item;
            }
        });
        return Object.values(days).slice(0, 7);
    };

    const getWeatherIcon = (condition) => {
        const iconSize = 40;
        const color = "white";
        switch (condition.toLowerCase()) {
            case 'clear': return <Sun size={iconSize} color={color} />;
            case 'clouds': return <Cloud size={iconSize} color={color} />;
            case 'rain':
            case 'drizzle': return <CloudRain size={iconSize} color={color} />;
            case 'snow': return <CloudSnow size={iconSize} color={color} />;
            case 'thunderstorm': return <CloudLightning size={iconSize} color={color} />;
            default: return <Cloud size={iconSize} color={color} />;
        }
    };

    const getWeatherGradient = (condition) => {
        switch (condition.toLowerCase()) {
            case 'clear': return 'var(--grad-clear)';
            case 'clouds': return 'var(--grad-cloudy)';
            case 'rain':
            case 'drizzle': return 'var(--grad-rain)';
            case 'snow': return 'var(--grad-snow)';
            case 'thunderstorm': return 'var(--grad-storm)';
            default: return 'rgba(255,255,255,0.05)';
        }
    };

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`glass-panel sidebar-container ${isCollapsed ? 'collapsed' : ''}`} style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '320px',
            maxHeight: 'calc(100vh - 40px)',
            zIndex: 1000,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'hidden', // Main container does not scroll
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(isCollapsed && { height: '80px', overflow: 'hidden' })
        }}>
            {/* Fixed Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
                {/* Mobile Drag Handle / Toggle */}
                <div
                    className="mobile-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        width: '100%',
                        padding: '5px 0',
                        cursor: 'pointer',
                        display: 'none', // Controlled by CSS
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '4px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '2px',
                    }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CloudLightning size={24} color="var(--primary)" />
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.4px' }}>SkyCast</h1>
                    </div>
                    {/* Desktop/Tablet can also have a toggle if needed, but primary focus is mobile */}
                </div>

                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '2px 8px'
                }}>
                    <input
                        type="text"
                        placeholder="Search city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <Search size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Map Layers</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['satellite', 'standard', 'dark'].map(layer => (
                            <button
                                key={layer}
                                onClick={() => setActiveLayer(layer)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: activeLayer === layer ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: activeLayer === layer ? '0 4px 10px rgba(59, 130, 246, 0.3)' : 'none'
                                }}
                            >
                                {layer}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="sidebar-scrollable-content" style={{
                flex: 1,
                overflowY: isCollapsed ? 'hidden' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                paddingRight: '4px', // Space for invisible scrollbar behavior
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <style>{`
                    .sidebar-scrollable-content::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {/* Location Status Component */}
                <LocationStatus status={locationStatus} onRetry={onLocate} />

                {isSearching ? (
                    <div className="animate-fade-in" style={{
                        marginTop: '10px',
                        padding: '30px 15px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                        <Navigation size={24} style={{ marginBottom: '12px', opacity: 0.8, animation: 'spin 2s linear infinite' }} />
                        <p style={{ fontWeight: 600 }}>Locating you...</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.6 }}>This may take a few seconds</p>
                    </div>
                ) : weatherData ? (
                    weatherData.error ? (
                        <div className="animate-fade-in" style={{
                            marginTop: '4px',
                            padding: '18px',
                            borderRadius: '16px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
                            fontSize: '0.85rem'
                        }}>
                            <p style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Oops! Something went wrong
                            </p>
                            <p style={{ opacity: 0.9 }}>{weatherData.error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="weather-card animate-fade-in" style={{
                                marginTop: '10px',
                                padding: '28px 24px',
                                background: getWeatherGradient(weatherData.weather[0].main),
                                borderRadius: '24px',
                                position: 'relative',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                color: 'white',
                                overflow: 'visible' // Ensure no clipping
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <h2 style={{
                                            fontSize: '1.6rem',
                                            fontWeight: 800,
                                            margin: 0,
                                            padding: '5px 0', // Vertical breathing room
                                            lineHeight: 1.3,
                                            letterSpacing: '-0.5px',
                                            wordBreak: 'break-word'
                                        }}>
                                            {weatherData.name}
                                        </h2>
                                        <p style={{
                                            color: 'rgba(255,255,255,0.85)',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                            marginTop: '2px'
                                        }}>
                                            {weatherData.weather[0].description}
                                        </p>
                                    </div>
                                    <div style={{ flexShrink: 0, paddingBottom: '5px' }}>
                                        {getWeatherIcon(weatherData.weather[0].main)}
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-1.5px' }}>
                                        {Math.round(weatherData.main.temp)}°
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500, marginTop: '6px' }}>
                                        Feels like {Math.round(weatherData.main.feels_like)}°C
                                    </p>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '10px',
                                    marginTop: '24px'
                                }}>
                                    <div className="detail-item" style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            <Droplets size={12} /> Humidity
                                        </div>
                                        <div style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                                            {weatherData.main.humidity}%
                                        </div>
                                    </div>
                                    <div className="detail-item" style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            <Wind size={12} /> Wind
                                        </div>
                                        <div style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                                            {weatherData.wind.speed} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>m/s</span>
                                        </div>
                                    </div>
                                    <div className="detail-item" style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            <Gauge size={12} /> Pressure
                                        </div>
                                        <div style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
                                            {weatherData.main.pressure} <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>hPa</span>
                                        </div>
                                    </div>
                                    <div className="detail-item" style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            <Eye size={12} /> Visibility
                                        </div>
                                        <div style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                                            {(weatherData.visibility / 1000).toFixed(1)} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AQI Section */}
                            {aqiData?.list?.[0] && (
                                <div style={{ padding: '8px 4px', marginTop: '10px', background: 'transparent' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Air Quality Index</p>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: getAQIDetails(aqiData.list[0].main.aqi).color }}>
                                                {getAQIDetails(aqiData.list[0].main.aqi).label}
                                            </h3>
                                        </div>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: getAQIDetails(aqiData.list[0].main.aqi).color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '1.2rem'
                                        }}>
                                            {aqiData.list[0].main.aqi}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                                        {getAQIDetails(aqiData.list[0].main.aqi).desc}
                                    </p>
                                </div>
                            )}

                            {/* Hourly Forecast */}
                            {forecastData?.list && (
                                <div style={{ marginTop: '20px' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>HOURLY FORECAST</p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        overflowX: 'auto',
                                        paddingBottom: '10px',
                                        scrollbarWidth: 'none'
                                    }}>
                                        {forecastData.list.slice(0, 8).map((hour, i) => (
                                            <div key={i} style={{
                                                minWidth: '65px',
                                                padding: '12px 8px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '14px',
                                                textAlign: 'center',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                    {new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
                                                    {React.cloneElement(getWeatherIcon(hour.weather[0].main), { size: 24 })}
                                                </div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{Math.round(hour.main.temp)}°</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weekly Forecast */}
                            {forecastData?.list && (
                                <div style={{ marginTop: '20px' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>7-DAY FORECAST</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {processWeeklyForecast(forecastData.list).map((day, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px' }}>
                                                    {i === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short' })}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {React.cloneElement(getWeatherIcon(day.weather[0].main), { size: 20 })}
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', width: '60px' }}>
                                                        {day.weather[0].main}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{Math.round(day.main.temp_max)}°</p>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{Math.round(day.main.temp_min)}°</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )
                ) : (
                    <div className="animate-fade-in" style={{
                        marginTop: '10px',
                        padding: '30px 15px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                        <Navigation size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <p>Detecting your location...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
