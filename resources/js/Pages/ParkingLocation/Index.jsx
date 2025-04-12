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
  const defaultLocation = { lat: 34.72531, lng: 135.23463 };
  const [location, setLocation] = useState(defaultLocation);
  const [error, setError] = useState(null);

  useEffect(() => {
    // まずは localStorage から座標を読み取る（戻ってきたとき用）
    const lastLocation = localStorage.getItem("lastLocation");
    console.log(lastLocation)
    if (lastLocation) {
      const { lat, lng } = JSON.parse(lastLocation);
      console.log(`${lat},${lng}`)
      setLocation({ lat, lng });
    }

    if ((!navigator.geolocation) && lastLocation) {
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
        console.log("現在地：", current.lat, current.lng);

        // APIリクエストのURLを動的に作成
        const url = `/api/fetch-parking?location=${current.lat},${current.lng}&radius=1500`;

        // APIリクエストを送信
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('取得した駐車場情報:', data);
            })
            .catch(error => {
                console.error('駐車場情報の取得エラー:', error);
            });
      },
      (err) => {
        setError("位置情報の取得に失敗しました。デフォルト位置を表示します。");
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={() => console.log("Maps API has loaded.")}
      >
        {error && (
          <>
            <div className="fixed inset-0 bg-black opacity-30 z-40" />
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-sm w-full z-50">
                <h2 className="text-red-600 font-semibold text-lg mb-4">エラー</h2>
                <p className="text-gray-800 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  閉じる
                </button>
              </div>
            </div>
          </>
        )}

        <Map
          style={{ width: "100%", height: "500px" }}
          defaultZoom={13}
          defaultCenter={location}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
          /*onCameraChanged={(ev) =>
            console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
          }*/
        >
          <AdvancedMarker key="current-location" position={location}>
            <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
          </AdvancedMarker>

          {locations.map((parking) => {
            const isRegistered = (parking.parking_records ?? []).some(
              (record) => record.user_id === props.auth.user.id
            );

            return (
              <AdvancedMarker
                key={parking.id}
                position={{ lat: parking.latitude, lng: parking.longitude }}
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
      </APIProvider>
    </Authenticated>
  );
};

export default Index;
