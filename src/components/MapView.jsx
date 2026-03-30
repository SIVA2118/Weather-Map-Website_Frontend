import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const OWM_API_KEY = 'da1da247fde612999f81ce6302c34988';

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();

    React.useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { duration: 0.8 });
        }
    }, [center, map]);

    return null;
};

const MapView = ({ activeLayer, center }) => {
    const getBaseUrl = () => {
        if (activeLayer === 'satellite') {
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        }
        if (activeLayer === 'dark') {
            return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        }
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    const getAttribution = () => {
        if (activeLayer === 'satellite') return '&copy; Esri';
        return '&copy; OpenStreetMap contributors';
    };

    return (
        <MapContainer
            center={center}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <ChangeView center={center} />

            <TileLayer
                url={getBaseUrl()}
                attribution={getAttribution()}
            />

            <TileLayer
                url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`}
                opacity={0.6}
            />

            <Marker position={center}>
                <Popup>Your Location</Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapView;
