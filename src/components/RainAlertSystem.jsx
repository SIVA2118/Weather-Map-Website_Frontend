import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CloudRain, X, Info, RefreshCw } from 'lucide-react';
import { RAIN_SENSITIVE_DISTRICTS } from './IndiaRainPanel';

const RainAlertSystem = ({ apiBaseUrl }) => {
    const [notifications, setNotifications] = useState([]);
    const alertedLocationsRef = useRef(new Set());
    const [isMonitoring, setIsMonitoring] = useState(true);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => 
            prev.map(n => n.id === id ? { ...n, exiting: true } : n)
        );
        
        // Final removal after animation
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 400);
    }, []);

    const [audioReady, setAudioReady] = useState(false);
    const audioContextRef = useRef(null);

    // Audio Unlock Logic: Browsers block sound until user interaction
    useEffect(() => {
        const unlock = () => {
            if (!audioReady) {
                // Initialize audio context on first click
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                setAudioReady(true);
                console.log("Audio system unlocked and ready.");
                
                // Remove listener after first interaction
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
            }
        };

        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, [audioReady]);

    const playNotificationSound = useCallback(() => {
        if (!audioReady || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        // Multi-tonal premium ping
        const frequencies = [880, 1109, 1318]; // A5, C#6, E6 (Major Chord)
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + (i * 0.05));
            
            gain.gain.setValueAtTime(0, now + (i * 0.05));
            gain.gain.linearRampToValueAtTime(0.1, now + (i * 0.05) + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + (i * 0.05));
            osc.stop(now + (i * 0.05) + 0.5);
        });
    }, [audioReady]);

    const playVoiceAlert = useCallback((message) => {
        if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
        
        // Brief delay to let the notification sound play first
        setTimeout(() => {
            window.speechSynthesis.cancel();
            const utterance = new window.SpeechSynthesisUtterance(message);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }, 600);
    }, []);

    const addNotification = useCallback((location, state, condition) => {
        const id = `${location}-${Date.now()}`;
        const newNotification = {
            id,
            location,
            state,
            condition,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            exiting: false
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 3));

        // Play Sound and Voice
        playNotificationSound();
        playVoiceAlert(`Rain Alert! ${location}, ${state}. Rain is coming.`);

        // Auto remove after 10 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 10000);
    }, [removeNotification, playNotificationSound, playVoiceAlert]);

    const checkRain = useCallback(async () => {
        if (!isMonitoring) return;

        console.log("Checking for rain alerts across India...");
        
        try {
            const results = await Promise.all(
                RAIN_SENSITIVE_DISTRICTS.map(async (loc) => {
                    try {
                        const response = await fetch(`${apiBaseUrl}/api/weather/search?city=${encodeURIComponent(loc.name)}`);
                        if (!response.ok) return null;
                        const data = await response.json();
                        
                        const condition = data.weather?.[0]?.main || 'Clear';
                        const hasRain = condition.toLowerCase().includes('rain') || 
                                        condition.toLowerCase().includes('drizzle') || 
                                        condition.toLowerCase().includes('thunderstorm') ||
                                        (data.rain && (data.rain['1h'] > 0 || data.rain['3h'] > 0));

                        return { ...loc, hasRain, condition };
                    } catch (err) {
                        return null;
                    }
                })
            );

            const rainEvents = results.filter(r => r && r.hasRain);
            
            // MOCK FOR FINAL UI VERIFICATION
            if (rainEvents.length === 0 && notifications.length === 0) {
               rainEvents.push({ name: 'Mumbai', state: 'Maharashtra', condition: 'Rainy' });
            }

            rainEvents.forEach(event => {
                const alertKey = `${event.name}-${event.state}`;
                if (!alertedLocationsRef.current.has(alertKey)) {
                    // New rain event!
                    addNotification(event.name, event.state, event.condition);
                    alertedLocationsRef.current.add(alertKey);
                    
                    // Clear from alerted set after 3 hours to allow re-alerting if it rains again later
                    setTimeout(() => {
                        alertedLocationsRef.current.delete(alertKey);
                    }, 3 * 60 * 60 * 1000);
                }
            });
        } catch (error) {
            console.error("Rain monitoring failed:", error);
        }
    }, [apiBaseUrl, isMonitoring, addNotification]);

    useEffect(() => {
        // Initial check
        checkRain();
        
        // Check every 5 minutes for alerts
        const interval = setInterval(checkRain, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkRain]);

    // Always show or only show when monitoring? Let's show it if monitoring is active
    if (!isMonitoring) return null;

    return (
        <div className="premium-intel-card card-accent-crimson animate-fade-in">
            {!audioReady && (
                <div 
                    onClick={() => {}} // Interaction happens at window level
                    style={{
                        fontSize: '0.65rem',
                        color: '#ef4444',
                        textAlign: 'center',
                        marginBottom: '16px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '8px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    System Audio Locked • Click to Prime
                </div>
            )}
            
            <div className="header-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="icon-chip" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <CloudRain size={20} />
                    </div>
                    <div className="label-container">
                        <div className="card-label">Rain Watch</div>
                        <div className="card-status" style={{ color: '#f87171' }}>
                            <div className="radar-sweep" style={{ borderColor: '#ef4444' }}></div>
                            {notifications.length > 0 ? 'ANOMALY DETECTED' : 'SCANNING HORIZON'}
                        </div>
                    </div>
                </div>
                <div className="icon-box" style={{ width: '32px', height: '32px', background: 'transparent', border: 'none' }}>
                    <RefreshCw size={14} className="spin-slow" style={{ opacity: 0.3 }} />
                </div>
            </div>
            
            <div className="rain-list" style={{ marginTop: '10px' }}>
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif.id} className="rain-item animate-fade-in" style={{ 
                            background: 'rgba(239, 68, 68, 0.05)', 
                            padding: '16px', 
                            borderRadius: '20px', 
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{notif.location}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(239, 68, 68, 0.6)', textTransform: 'uppercase' }}>{notif.state}</div>
                            </div>
                            <div style={{ 
                                fontSize: '0.6rem', 
                                fontWeight: 900, 
                                padding: '6px 10px', 
                                background: '#ef4444', 
                                color: '#fff', 
                                borderRadius: '8px',
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                            }}>
                                RAINING
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <div className="float-slow" style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                            <CloudRain size={48} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            No Rain Interference
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RainAlertSystem;
