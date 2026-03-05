import React from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const MapView = ({ activeLayer, center }) => {
    const API_KEY = "da1da247fde612999f81ce6302c34988"; // Hardcoded for tile access consistency
    const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const standardUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const getBaseUrl = () => {
        if (activeLayer === 'satellite') return satelliteUrl;
        if (activeLayer === 'dark') return darkUrl;
        return standardUrl;
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
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* Rain Radar Layer */}
            <TileLayer
                url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                opacity={0.6}
            />

            <Marker position={center}>
                <Popup>Your Location</Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapView;
