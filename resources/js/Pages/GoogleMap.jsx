import React from "react";
import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
} from "@vis.gl/react-google-maps";

const MyMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザから位置情報を入手できませんでした。")
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
          onCameraChanged={(ev) =>
            console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
          }
          />
        ) : (
          <h2>位置情報を取得中...</h2>
        )
      )}

    </APIProvider>
  );
};

export default MyMap;