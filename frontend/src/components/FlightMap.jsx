import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plane } from 'lucide-react';

// Fix for default marker icon issues in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Plane Icon
const planeIcon = new L.DivIcon({
    html: `<div style="transform: rotate(45deg); color: #2563eb;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane"><path d="M20.5 18a1.5 1.5 0 0 0-1.5-1.5h-4l-4.5-9H6.5l3 9H3.5l-1 2h19a1.5 1.5 0 0 0 1.5-1.5V18z"/></svg></div>`,
    className: 'plane-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Component to animate the plane
const PlaneMarker = ({ from, to }) => {
    const [position, setPosition] = useState(from);
    const map = useMap();

    useEffect(() => {
        let start = null;
        const duration = 5000; // Animation duration in ms

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;

            if (progress < 1) {
                const lat = from[0] + (to[0] - from[0]) * progress;
                const lng = from[1] + (to[1] - from[1]) * progress;
                setPosition([lat, lng]);
                requestAnimationFrame(animate);
            } else {
                setPosition(to);
            }
        };

        requestAnimationFrame(animate);
    }, [from, to]);

    return <Marker position={position} icon={planeIcon} />;
};

const FlightMap = ({ origin, destination }) => {
    // Default coordinates if missing (should mitigate with validation upstream)
    const from = [origin.latitude || 0, origin.longitude || 0];
    const to = [destination.latitude || 0, destination.longitude || 0];

    // Calculate center for initial view
    const center = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

    return (
        <div className="h-full min-h-[400px] w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <MapContainer center={center} zoom={3} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={from}>
                    <Popup>Origin: {origin.city} ({origin.code})</Popup>
                </Marker>
                <Marker position={to}>
                    <Popup>Destination: {destination.city} ({destination.code})</Popup>
                </Marker>
                <Polyline positions={[from, to]} color="blue" dashArray="10, 10" opacity={0.5} />
                <PlaneMarker from={from} to={to} />
            </MapContainer>
        </div>
    );
};

export default FlightMap;
