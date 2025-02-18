import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from "@vis.gl/react-google-maps";
import { Link, router } from '@inertiajs/react';

const Index = (props) => {
  const { locations } = props;
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
  const handleDeleteLocation = (id) => {
    router.delete(`/locations/${id}`, {
        onBefore: () => confirm("本当に削除しますか？"),
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザから位置情報を入手できませんでした。");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        console.log("現在地：", position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError("位置情報の取得に失敗しました。" + err.message);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <Authenticated user={props.auth.user} header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        Index
      </h2>
    }>
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={() => console.log("Maps API has loaded.")}
      >
        {error ? (
          <h2 style={{color: "red"}}>{error}</h2>
        ) : (
          location ? (
            <Map
              style={{ width: "100%", height: "500px" }} // 幅100%、高さ500px
              defaultZoom={13}
              defaultCenter={location}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
              onCameraChanged={(ev) =>
                console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
              }
            >
              <AdvancedMarker key={`${location.lat}-${location.lng}`} position={location}>
                <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
              </AdvancedMarker>
            </Map>
          ) : (
            <h2>位置情報を取得中...</h2>
          )
        )}
      </APIProvider>

      <div className="p-12">
        <Link href={`/locations/register`}>register</Link>
        <h1>ID</h1>
        {locations.map((location) => {
          console.log(location); // デバッグ用のログ
          return (
            <div key={location.id}> {/* ここで key を追加 */}
              <h2>
                <Link href={`/locations/${location.id}`}>{location.id}</Link>
              </h2>
              <p>緯度 {location.latitude}</p>
              <p>経度 {location.longitude}</p>
              <p>種類 {location.parking_type?.name ?? "未登録"}</p>
              <button 
                className="p-1 bg-purple-300 hover:bg-purple-400 rounded-md" 
                onClick={() => handleDeleteLocation(location.id)}
              >
                delete
              </button>
            </div>
          );
        })}

      </div>
    </Authenticated>
  );
};

export default Index;
