import React, { useEffect, useMemo, useState } from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';

const TAMIL_NADU_DISTRICTS = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Vellore',
    'Erode',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Sivaganga',
    'Virudhunagar',
    'Karur',
    'Namakkal',
    'Cuddalore',
    'Nagapattinam',
    'Tiruvarur',
    'Ramanathapuram',
    'Pudukkottai',
    'Kanchipuram',
    'Tiruvallur',
    'Krishnagiri',
    'Dharmapuri',
    'Ariyalur',
    'Perambalur',
    'Mayiladuthurai',
    'Ranipet',
    'Tenkasi',
    'Tirupathur',
    'Kallakurichi',
    'Chengalpattu',
    'The Nilgiris',
    'Theni',
    'Kanyakumari',
    'Viluppuram',
    'Tiruppur',
    'Thiruvannamalai'
];

const TamilNaduTicker = ({ apiBaseUrl }) => {
    const [reports, setReports] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const fetchDistrictReports = async () => {
            setLoading(true);
            setError('');

            try {
                const results = await Promise.all(
                    TAMIL_NADU_DISTRICTS.map(async (district) => {
                        try {
                            const response = await fetch(`${apiBaseUrl}/api/weather/search?city=${encodeURIComponent(district)}`);
                            if (!response.ok) return null;
                            const data = await response.json();

                            return {
                                district,
                                temperature: Math.round(data.main?.temp ?? 0),
                                condition: data.weather?.[0]?.main ?? 'Unknown',
                                humidity: data.main?.humidity ?? null,
                                wind: data.wind?.speed ?? null
                            };
                        } catch {
                            return null;
                        }
                    })
                );

                if (isCancelled) return;

                const valid = results.filter(Boolean);
                if (valid.length === 0) {
                    setReports([]);
                    setError('Unable to fetch Tamil Nadu district report right now.');
                } else {
                    setReports(valid);
                    setActiveIndex(0);
                    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
            } catch {
                if (!isCancelled) {
                    setReports([]);
                    setError('Unable to fetch Tamil Nadu district report right now.');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchDistrictReports();
        const refreshTimer = setInterval(fetchDistrictReports, 30 * 60 * 1000);

        return () => {
            isCancelled = true;
            clearInterval(refreshTimer);
        };
    }, [apiBaseUrl]);

    useEffect(() => {
        if (reports.length <= 1) return undefined;

        const rotateTimer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % reports.length);
        }, 3500);

        return () => clearInterval(rotateTimer);
    }, [reports]);

    const activeReport = useMemo(() => {
        if (reports.length === 0) return null;
        return reports[activeIndex % reports.length];
    }, [reports, activeIndex]);

    return (
        <div className="premium-intel-card card-accent-indigo animate-fade-in">
            <div className="header-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="icon-chip" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                        <CloudSun size={20} />
                    </div>
                    <div className="label-container">
                        <div className="card-label">Regional Pulse</div>
                        <div className="card-status">
                            <RefreshCw size={10} className="spin-slow" /> ACTIVE MONITORING
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <div className="spin-slow" style={{ color: '#818cf8', marginBottom: '12px' }}>
                        <RefreshCw size={28} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synchronizing climate matrix...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px' }}>
                    {error}
                </div>
            ) : activeReport ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1 }}>
                                {activeReport.district}
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Tamil Nadu <span style={{ opacity: 0.2 }}>|</span> India
                            </p>
                        </div>
                        <div className="float-slow" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <CloudSun size={32} color="#818cf8" />
                             </div>
                             <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{activeReport.condition}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '24px', gap: '8px' }}>
                        <span className="text-glow-primary" style={{ fontSize: '4.8rem', fontWeight: 800, lineHeight: 0.8, color: '#fff' }}>
                            {activeReport.temperature}
                        </span>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#818cf8' }}>°C</span>
                    </div>

                    <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="metric-tile">
                            <div className="metric-label">Humidity</div>
                            <div className="metric-value">{activeReport.humidity}%</div>
                        </div>
                        <div className="metric-tile">
                            <div className="metric-label">Wind Velocity</div>
                            <div className="metric-value">{activeReport.wind} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>m/s</span></div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {reports.slice(0, 10).map((_, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        width: i === activeIndex ? '24px' : '6px', 
                                        height: '6px', 
                                        background: i === activeIndex ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                        transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                                        boxShadow: i === activeIndex ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'none'
                                    }} 
                                />
                            ))}
                        </div>
                        <div className="badge-premium" style={{ borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>
                            {lastUpdated}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default TamilNaduTicker;
