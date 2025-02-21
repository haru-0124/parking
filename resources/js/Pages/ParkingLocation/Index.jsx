import React, { useEffect, useState} from "react";
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
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
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
  console.log("駐車場データ:", locations);

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
              {location && (
                <AdvancedMarker key="current-location" position={location}>
                  <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
                </AdvancedMarker>
              )}
              
              {locations.map((parking) => (
                <AdvancedMarker
                  key={parking.id}
                  position={{ lat: parking.latitude, lng: parking.longitude}}
                  onClick={() => router.visit(`/locations/${parking.id}`)} 
                >
                  <Pin background={"#4285F4"} glyphColor={"#fff"} borderColor={"#000"}/>
                </AdvancedMarker>
              ))}
            </Map>
          ) : (
            <h2>位置情報を取得中...</h2>
          )
        )}
      </APIProvider>
      <div>
        <Link href="/locations/register">register</Link>
      </div>
    </Authenticated>
  );
};

export default Index;
