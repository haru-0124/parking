import React, { useEffect, useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from "@vis.gl/react-google-maps";
import { Link, router } from '@inertiajs/react';

const Index = (props) => {
  const { locations } = props;
  const defaultLocation = { lat: parseFloat(34.72531), lng: parseFloat(135.23463) };
  const [location, setLocation] = useState(defaultLocation);
  const [clickedLocation, setClickedLocation] = useState(defaultLocation);
  const [error, setError] = useState(null);
  const [latLng, setLatLng] = useState(null);

  useEffect(() => {
    const lastLocation = localStorage.getItem("lastLocation");
    if (lastLocation) {
      const { lat, lng } = JSON.parse(lastLocation);
      setLocation({ lat, lng });
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

  return (
    <Authenticated
      user={props.auth.user}
      header={(
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">ホーム</h2>
          <nav className="flex space-x-4">
            <Link href="/locations/register" className="font-semibold text-xl text-gray-800 leading-tight">新しい駐車場の登録</Link>
          </nav>
        </div>
      )}
    >
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
                setLatLng(e.latLng);
                if (!latLng) return;

                const lat = parseFloat(latLng.lat());
                const lng = parseFloat(latLng.lng());
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
                    })
                    .catch(error => {
                      console.error('駐車場情報の取得エラー:', error);
                    });
                    router.visit('/locations', {
                      only: ['locations'],
                      preserveState: false,
                      onSuccess: () => {
                        console.log("ページをリロードして最新の駐車場情報を取得しました");
                      }
                    });
                }
              }}
            >
              <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
            </AdvancedMarker>

            {locations.map((parking) => {
              console.log(`lat ${parking.latitude}`)
              console.log(`lng ${parking.longitude}`)
              const isRegistered = (parking.parking_records ?? []).some(
                (record) => record.user_id === props.auth.user.id
              );

              return (
                <AdvancedMarker
                  key={parking.id}
                  position={{ lat: parseFloat(parking.latitude), lng: parseFloat(parking.longitude) }}
                  onClick={() => router.visit(`/locations/${parking.id}`)}
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
    </Authenticated>
  );
};

export default Index;
