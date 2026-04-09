import React from 'react';
import { MapPin, AlertCircle, Info, Settings } from 'lucide-react';

const LocationStatus = ({ status, onRetry }) => {
    if (status === 'granted') return null;

    const styles = {
        container: {
            margin: '10px 0',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fade-in 0.3s ease'
        },
        denied: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5'
        },
        prompt: {
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#93c5fd'
        },
        error: {
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: '#fcd34d'
        },
        button: {
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s'
        }
    };

    if (status === 'denied') {
        return (
            <div style={{ ...styles.container, ...styles.denied }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <AlertCircle size={18} /> Location Blocked
                </div>
                <p>Google Chrome has blocked location for this site. To fix it:</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>Click the <b>Settings icon</b> (or Lock icon) in the address bar.</li>
                        <li>Find <b>Location</b> and toggle it <b>ON</b>.</li>
                        <li><b>Refresh</b> the page.</li>
                    </ol>
                </div>
                <button
                    style={styles.button}
                    onClick={() => window.location.reload()}
                >
                    <Settings size={14} /> Refresh Page
                </button>
            </div>
        );
    }

    if (status === 'approximate') {
        return (
            <div style={{ ...styles.container, ...styles.error, background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Info size={18} /> Approximate Location
                </div>
                <p>We've detected your location via network. This might be inaccurate (e.g., showing a regional hub like Chennai).</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        style={{ ...styles.button, flex: 1, background: 'rgba(59,130,246,0.3)' }}
                        onClick={() => {}} // Just dismiss or stay
                    >
                        It's Correct
                    </button>
                    <button
                        style={{ ...styles.button, flex: 1 }}
                        onClick={() => {
                            // Trigger search focus or similar
                            const input = document.querySelector('input[placeholder="Search city..."]');
                            if (input) input.focus();
                        }}
                    >
                        Search My City
                    </button>
                </div>
            </div>
        );
    }

    return null;
};


export default LocationStatus;
