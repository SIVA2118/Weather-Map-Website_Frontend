import React, { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
    AlertTriangle,
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
    Search,
    X,
    History,
    Trash2,
    Clock
} from 'lucide-react';
import LocationStatus from './LocationStatus';
import { getWeatherAlert } from '../utils/weatherAlert';
import { getSearchHistory, clearSearchHistory } from '../utils/historyUtils';

const Sidebar = ({ activeLayer, setActiveLayer, weatherData, forecastData, aqiData, onLocate, onSearch, locationStatus, isSearching }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const lastWeatherChangeKeyRef = useRef('');

    useEffect(() => {
        if (showHistory) {
            setHistory(getSearchHistory());
        }
    }, [showHistory]);

    const handleHistoryClick = (city) => {
        onSearch(city);
        setShowHistory(false);
    };

    const handleClearHistory = () => {
        clearSearchHistory();
        setHistory([]);
    };

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
    const [timedAlert, setTimedAlert] = useState(null);
    const alertTimeoutRef = useRef(null);

    const weatherAlert = useMemo(() => getWeatherAlert(weatherData, aqiData), [weatherData, aqiData]);
    const alertKey = weatherAlert ? `${weatherAlert.level}:${weatherAlert.message}` : '';
    const weatherStamp = weatherData?.dt ?? '';
    const aqiStamp = aqiData?.list?.[0]?.dt ?? '';
    const alertTriggerKey = `${alertKey}|${weatherStamp}|${aqiStamp}`;

    const playVoiceAlert = (message) => {
        if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new window.SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (!alertKey) {
            setTimedAlert(null);
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
                alertTimeoutRef.current = null;
            }
            return;
        }

        setTimedAlert(weatherAlert);

        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }

        alertTimeoutRef.current = setTimeout(() => {
            setTimedAlert(null);
            alertTimeoutRef.current = null;
        }, 30000);

        return () => {
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
                alertTimeoutRef.current = null;
            }
        };
    }, [alertTriggerKey, alertKey, weatherAlert]);

    useEffect(() => {
        if (!weatherData || weatherData.error) {
            return;
        }

        const cityName = weatherData.name || 'Selected location';
        const condition = weatherData.weather?.[0]?.main || 'Weather update';
        const description = weatherData.weather?.[0]?.description || '';
        const temperature = Math.round(weatherData.main?.temp ?? 0);
        const aqiValue = aqiData?.list?.[0]?.main?.aqi ?? 'na';
        const changeKey = `${cityName}|${condition}|${temperature}|${aqiValue}|${weatherStamp}|${aqiStamp}`;

        if (lastWeatherChangeKeyRef.current === changeKey) {
            return;
        }

        lastWeatherChangeKeyRef.current = changeKey;

        const alertLevel = weatherAlert?.level || 'info';
        const swalIcon = alertLevel === 'high' ? 'warning' : 'info';
        const message = weatherAlert?.message || `${condition}: ${description}. Current temperature is ${temperature}°C.`;
        const details = Array.isArray(weatherAlert?.details) ? weatherAlert.details : [];
        const combinedVoiceMessage = [message, ...details].join('. ');

        playVoiceAlert(combinedVoiceMessage);

        const detailMarkup = details.length > 0
            ? `<ul style="margin: 12px 0 0; padding-left: 18px; text-align: left; font-size: 0.9rem; line-height: 1.45;">${details
                .map((detail) => `<li style=\"margin-bottom: 6px;\">${detail}</li>`)
                .join('')}</ul>`
            : '';

        Swal.fire({
            title: `Weather changed in ${cityName}`,
            html: `<p style="margin: 0;">${message}</p>${detailMarkup}`,
            icon: swalIcon,
            timer: 4800,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#0d2437',
            color: '#ecf6ff',
            didOpen: () => {
                const popup = Swal.getPopup();
                if (popup) {
                    popup.style.border = '1px solid rgba(154, 218, 244, 0.28)';
                    popup.style.borderRadius = '16px';
                }
            }
        });
    }, [weatherData, aqiData, weatherAlert, weatherStamp, aqiStamp]);

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
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: showHistory ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            marginLeft: '4px'
                        }}
                        title="Search History"
                    >
                        <History size={18} />
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

                <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '2px'
                }}>
                    <Navigation size={14} color="var(--primary)" />
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.4 }}>
                        Location wrong? <strong>Click/tap on the map</strong> to set it manually.
                    </p>
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

                {/* Search History View */}
                {showHistory && (
                    <div className="animate-fade-in" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px',
                        marginBottom: '4px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                <Clock size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Recent Searches</span>
                            </div>
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                                    title="Clear All"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {history.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {history.map((city, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleHistoryClick(city)}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'white',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    >
                                        <span>{city}</span>
                                        <Search size={14} style={{ opacity: 0.5 }} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '0.8rem' }}>No recent searches found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Location Status Component */}
                <LocationStatus status={locationStatus} onRetry={onLocate} />

                {/* Suggested Cities (shown when location is approximate or not set) */}
                {locationStatus === 'approximate' && (
                    <div className="animate-fade-in" style={{
                        marginTop: '4px',
                        padding: '12px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Quick Select</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['Tiruppur', 'Coimbatore', 'Chennai', 'Madurai'].map(city => (
                                <button
                                    key={city}
                                    onClick={() => onSearch(city)}
                                    style={{
                                        padding: '8px 4px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {timedAlert && (
                    <div className="animate-fade-in" style={{
                        marginTop: '4px',
                        padding: '14px',
                        borderRadius: '14px',
                        boxShadow: timedAlert.level === 'high' ? '0 10px 26px rgba(239, 68, 68, 0.22)' : '0 10px 26px rgba(245, 158, 11, 0.2)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        background: timedAlert.level === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: timedAlert.level === 'high' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
                        color: timedAlert.level === 'high' ? '#fecaca' : '#fde68a',
                        fontSize: '0.82rem',
                        lineHeight: 1.45
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px'
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <AlertTriangle size={14} /> Weather Alert
                            </p>
                            <button
                                onClick={() => setTimedAlert(null)}
                                aria-label="Dismiss notification"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'inherit',
                                    opacity: 0.75,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2px'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{timedAlert.message}</p>
                        {Array.isArray(timedAlert.details) && timedAlert.details.length > 0 && (
                            <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.76rem', opacity: 0.9 }}>
                                {timedAlert.details.map((detail, index) => (
                                    <li key={`${detail}-${index}`} style={{ marginBottom: '4px' }}>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p style={{ margin: '6px 0 0', fontSize: '0.72rem', opacity: 0.7 }}>Auto hides in 30s</p>
                    </div>
                )}

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
                                            wordBreak: 'break-word',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            {weatherData.name}
                                            {locationStatus === 'approximate' && (
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    background: 'rgba(255,255,255,0.15)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: 'rgba(255,255,255,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    Estimated
                                                </span>
                                            )}
                                            {locationStatus === 'granted' && (
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#6ee7b7',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                                }}>
                                                    Verified
                                                </span>
                                            )}
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
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: 'rgba(255,255,255,0.6)',
                                            fontSize: '0.7rem',
                                            marginTop: '6px',
                                            fontFamily: 'monospace'
                                        }}>
                                            <span>Lat: {weatherData.coord?.lat.toFixed(4)}</span>
                                            <span>•</span>
                                            <span>Lon: {weatherData.coord?.lon.toFixed(4)}</span>
                                        </div>
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
