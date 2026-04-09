import React, { useEffect, useMemo, useState } from 'react';
import { CloudRain, Droplets, MapPin, Wind, RefreshCw } from 'lucide-react';

export const RAIN_SENSITIVE_DISTRICTS = [
    { name: 'Idukki', state: 'Kerala' },
    { name: 'Ratnagiri', state: 'Maharashtra' },
    { name: 'Cherrapunji', state: 'Meghalaya' },
    { name: 'Agumbe', state: 'Karnataka' },
    { name: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Mawsynram', state: 'Meghalaya' },
    { name: 'Wayanad', state: 'Kerala' },
    { name: 'Darjeeling', state: 'West Bengal' },
    { name: 'Mahabaleshwar', state: 'Maharashtra' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Kolkata', state: 'West Bengal' },
    { name: 'Shillong', state: 'Meghalaya' },
    { name: 'Kochi', state: 'Kerala' },
    { name: 'Hyderabad', state: 'Telangana' },
    { name: 'Bengaluru', state: 'Karnataka' },
    { name: 'Delhi', state: 'Delhi' },
    { name: 'Guwahati', state: 'Assam' },
    { name: 'Bhubaneswar', state: 'Odisha' },
    { name: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Patna', state: 'Bihar' },
    { name: 'Shimla', state: 'Himachal Pradesh' },
    { name: 'Srinagar', state: 'Jammu & Kashmir' }
];

const IndiaRainPanel = ({ apiBaseUrl }) => {
    const [reports, setReports] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const fetchRainReports = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    RAIN_SENSITIVE_DISTRICTS.map(async (loc) => {
                        try {
                            const response = await fetch(`${apiBaseUrl}/api/weather/search?city=${encodeURIComponent(loc.name)}`);
                            if (!response.ok) return null;
                            const data = await response.json();

                            return {
                                name: loc.name,
                                state: loc.state,
                                temp: Math.round(data.main?.temp ?? 0),
                                condition: data.weather?.[0]?.main ?? 'Unknown',
                                rain: data.rain?.['1h'] || data.rain?.['3h'] || 0,
                                humidity: data.main?.humidity ?? 0,
                                wind: data.wind?.speed ?? 0
                            };
                        } catch {
                            return null;
                        }
                    })
                );

                if (isCancelled) return;

                const valid = results.filter(Boolean);
                if (valid.length === 0) {
                    setError('No rain data available.');
                } else {
                    setReports(valid);
                    setActiveIndex(0);
                }
            } catch (err) {
                if (!isCancelled) setError('Failed to fetch India climate data.');
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        fetchRainReports();
        const interval = setInterval(fetchRainReports, 20 * 60 * 1000); // 20 min
        return () => {
            isCancelled = true;
            clearInterval(interval);
        };
    }, [apiBaseUrl]);

    useEffect(() => {
        if (reports.length <= 1) return;
        const rotate = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % reports.length);
        }, 5000);
        return () => clearInterval(rotate);
    }, [reports]);

    const active = useMemo(() => reports[activeIndex] || null, [reports, activeIndex]);

    return (
        <div className="premium-intel-card card-accent-blue animate-fade-in">
            <div className="header-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="icon-chip" style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#38bdf8', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
                        <CloudRain size={20} />
                    </div>
                    <div className="label-container">
                        <div className="card-label">Rain Climate</div>
                        <div className="card-status" style={{ color: '#38bdf8' }}>
                            NATIONAL SCAN ACTIVE
                        </div>
                    </div>
                </div>
            </div>

            {loading && !reports.length ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <div className="spin-slow" style={{ color: '#38bdf8', marginBottom: '12px' }}>
                        <RefreshCw size={28} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scanning national climate matrix...</p>
                </div>
            ) : active ? (
                <div key={active.name} className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px', color: '#fff', lineHeight: 1.1 }}>
                                {active.name}
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={12} /> {active.state}
                            </p>
                            
                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span className="text-glow-primary" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff' }}>{active.temp}°</span>
                                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>{active.condition}</span>
                            </div>
                        </div>

                        {/* Circular Rain Gauge */}
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                            <svg width="90" height="90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="45" 
                                    fill="none" 
                                    stroke="#38bdf8" 
                                    strokeWidth="8" 
                                    strokeDasharray={`${(Math.min(active.rain, 20) / 20) * 283} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                    style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))' }}
                                />
                                <text x="50" y="55" fontSize="18" fontWeight="800" fill="#fff" textAnchor="middle">{active.rain}</text>
                                <text x="50" y="70" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.4)" textAnchor="middle" style={{ textTransform: 'uppercase' }}>mm/h</text>
                            </svg>
                        </div>
                    </div>

                    <div className="metric-grid" style={{ marginTop: '24px' }}>
                        <div className="metric-tile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Droplets size={16} color="#38bdf8" />
                            <div>
                                <div className="metric-label">Humidity</div>
                                <div className="metric-value">{active.humidity}%</div>
                            </div>
                        </div>
                        <div className="metric-tile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Wind size={16} color="#38bdf8" />
                            <div>
                                <div className="metric-label">Wind</div>
                                <div className="metric-value">{active.wind} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>m/s</span></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {reports.slice(0, 10).map((_, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    width: i === activeIndex ? '24px' : '6px', 
                                    height: '6px', 
                                    background: i === activeIndex ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '3px',
                                    transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                                    boxShadow: i === activeIndex ? '0 0 12px rgba(14, 165, 233, 0.5)' : 'none'
                                }} 
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scanning India for rain activity...</p>
                </div>
            )}
        </div>
    );
};

export default IndiaRainPanel;
