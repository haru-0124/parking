import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const pinIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
});

function MapWithRightClick({ setLocation }) {
  const [pin, setPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useMapEvents({
    contextmenu(e) {
      const { lat, lng } = e.latlng;
      setPin({ lat, lng });
      setShowPopup(true);
      setLocation({ lat, lng });
    },
  });

  return (
    <>
      {pin && (
        <Marker position={[pin.lat, pin.lng]} icon={pinIcon}>
          {showPopup && (
            <Popup onClose={() => setShowPopup(false)}>
              <div>
                <h4>この位置を中心として駐車場情報を取得し、登録しますか？</h4>
                <button onClick={() => alert('登録処理へ')}>はい</button>
              </div>
            </Popup>
          )}
        </Marker>
      )}
    </>
  );
}

export default function ParkingMap({ location, setLocation }) {
  return (
    <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapWithRightClick setLocation={setLocation} />
    </MapContainer>
  );
}
