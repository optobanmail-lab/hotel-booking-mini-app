import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

export default function HotelMap({ hotels, center }) {
    const mapCenter = center ?? (hotels[0] ? [hotels[0].lat, hotels[0].lng] : [43.2383, 76.9455])

    return (
        <MapContainer center={mapCenter} zoom={12} style={{ height: 520, width: '100%', borderRadius: 12 }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hotels.map((h) => (
                <Marker key={h.id} position={[h.lat, h.lng]}>
                    <Popup>
                        <div style={{ minWidth: 180 }}>
                            <div style={{ fontWeight: 700 }}>{h.name}</div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{h.address}</div>
                            <div style={{ fontSize: 12 }}>⭐ {h.rating} • от {h.price_from_kzt} ₸</div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}