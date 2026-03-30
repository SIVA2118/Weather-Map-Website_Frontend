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
        <div className="tn-ticker">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CloudSun size={16} color='#93c5fd' />
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3px' }}>Tamil Nadu District Weather</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <RefreshCw size={12} /> Auto
                </div>
            </div>

            {loading ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading district weather...</p>
            ) : error ? (
                <p style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{error}</p>
            ) : activeReport ? (
                <>
                    <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)'
                    }}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{activeReport.district}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.45rem', fontWeight: 800 }}>{activeReport.temperature}°C</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeReport.condition}</p>
                        <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Humidity {activeReport.humidity ?? '-'}% | Wind {activeReport.wind ?? '-'} m/s
                        </p>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {reports.slice(0, 10).map((item, index) => (
                            <span
                                key={item.district}
                                title={item.district}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '999px',
                                    background: index === activeIndex ? '#60a5fa' : 'rgba(255,255,255,0.2)'
                                }}
                            />
                        ))}
                    </div>

                    <p style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Updated {lastUpdated}. Rotating every 3.5s.
                    </p>
                </>
            ) : null}
        </div>
    );
};

export default TamilNaduTicker;
