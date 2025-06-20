import React, { useEffect, useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from "@vis.gl/react-google-maps";
import { Head, router } from '@inertiajs/react';

const Index = (props) => {
  const { locations } = props;
  const defaultLocation = { lat: parseFloat(34.72531), lng: parseFloat(135.23463) };
  const [location, setLocation] = useState(defaultLocation);
  const [clickedLocation, setClickedLocation] = useState(defaultLocation);
  const [error, setError] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    parkingId: null,
  });

  const handlePinClick = (parkingId, e) => {
    e.domEvent.preventDefault(); // デフォルト右クリック抑制
    setContextMenu({
      visible: true,
      x: e.domEvent.pageX,
      y: e.domEvent.pageY,
      parkingId,
    });
  };

  
  useEffect(() => {
    const lastLocation = localStorage.getItem("lastLocation");
    if (lastLocation) {
      const { lat, lng } = JSON.parse(lastLocation);
      setLocation({ lat:parseFloat(lat), lng:parseFloat(lng) });
      console.log(`lat ${lat}`)
      console.log(`lng ${lng}`)
      console.log("現在のlocation:", JSON.stringify(location)); 
      localStorage.removeItem("lastLocation");
      return;
    }

    if (!navigator.geolocation && lastLocation) {
      setError("お使いのブラウザは位置情報に対応していません。デフォルト位置を表示します。");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(current);

        fetch(`/api/fetch-parking?location=${current.lat},${current.lng}&radius=1500`)
          .then(response => response.json())
          .then(data => console.log('取得した駐車場情報:', data))
          .catch(error => console.error('駐車場情報の取得エラー:', error));
      },
      (err) => {
        setError("位置情報の取得に失敗しました。デフォルト位置を表示します。");
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleClick = (e) => {
    setLatLng(e.detail.latLng);
    if (!latLng) return;
  
    const lat = parseFloat(latLng.lat);
    const lng = parseFloat(latLng.lng);
  
    console.log("クリック座標: ", lat, lng);
    setClickedLocation({ lat, lng });
  };

  const LegendPin = ({ color }) => (
    <svg width="12" height="16" viewBox="0 0 24 24" className="mr-1">
      <path
        fill={color}
        stroke="#000"
        strokeWidth="1"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      />
    </svg>
  );

  return (
    <Authenticated
      user={props.auth.user}
      header={(
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">駐車場を探す</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* ピンの凡例（レジェンド） */}
          <div className="flex items-center space-x-1">
            <LegendPin color="#FBBC04" />
            <span className="text-sm text-gray-600">現在地</span>
          </div>
          <div className="flex items-center space-x-1">
            <LegendPin color="#34A853" />
            <span className="text-sm text-gray-600">あなたが駐車中の駐車場</span>
          </div>
          <div className="flex items-center space-x-1">
            <LegendPin color="#4285F4" />
            <span className="text-sm text-gray-600">その他の駐車場</span>
          </div>
        </div>
      </div>
      )}
    >
      <Head title="駐車場を探す" />
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <div>
          <Map
            key={JSON.stringify(location)} // ここがポイント！
            style={{ width: "100%", height: "500px" }}
            defaultZoom={13}
            defaultCenter={location}
            mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
            onClick={handleClick}
          >
            <AdvancedMarker
              key="current-location"
              position={clickedLocation}
              draggable={true}
              onDragEnd={(e) => {
                const lat = parseFloat(e.latLng.lat());
                const lng = parseFloat(e.latLng.lng());
                setClickedLocation({lat, lng})
                console.log("ドラッグ移動後の位置:", lat, lng);
              }}
              onClick={() => {
                if (window.confirm("この位置の周辺駐車場を取得しますか？")) {
                  const { lat, lng } = clickedLocation;
                  localStorage.setItem("lastLocation", JSON.stringify(clickedLocation));
                  console.log("ドラッグ移動後の位置:", lat, lng);

                  fetch(`/api/fetch-parking?location=${lat},${lng}&radius=1500`)
                    .then(response => response.json())
                    .then(data => {
                      console.log('取得した駐車場情報:', data);

                      if (data.saved && data.saved.length > 0) {
                        router.visit('/locations', {
                          only: ['locations'],
                          preserveState: false,
                          onSuccess: () => {
                            console.log("新しい駐車場が登録されたのでページをリロードしました");
                          }
                        });
                      } else {
                        console.log("新規登録はありませんでした。リロードしません。");
                      }
                    })
                }}}
            >
              <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
            </AdvancedMarker>

            {locations.map((parking) => {
              const isRegistered = (parking.parking_records ?? []).some(
                (record) => record.user_id === props.auth.user.id
              );

              return (
                <AdvancedMarker
                  key={parking.id}
                  position={{ lat: parseFloat(parking.latitude), lng: parseFloat(parking.longitude) }}
                  onClick={(e) => handlePinClick(parking.id, e)}
                >
                  <Pin
                    background={isRegistered ? "#34A853" : "#4285F4"}
                    glyphColor={"#fff"}
                    borderColor={"#000"}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </div>
      </APIProvider>
      {contextMenu.visible && (
        <div
          className="absolute z-50 bg-white border shadow-lg rounded w-40"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          <ul className="text-sm text-gray-800">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                axios.post(`/locations/${contextMenu.parkingId}`, {
                  parking_location_id: contextMenu.parkingId,
                  user_id: props.auth.user.id,
                }).then(() => {
                  alert("駐車場を登録しました！");
                  setContextMenu({ ...contextMenu, visible: false });
                  router.visit('/dashboard')
                }).catch((error) => {
                  alert("登録に失敗しました。");
                  console.error(error);
                  setContextMenu({ ...contextMenu, visible: false });
                });
              }}
            >
              🚗 登録する
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.visit(`/locations/${contextMenu.parkingId}`);
              }}
            >
              🔍 詳細を見る
            </li>
          </ul>
        </div>
      )}
    </Authenticated>
  );
};

export default Index;
