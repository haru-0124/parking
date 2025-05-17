import React, { useState } from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from "@vis.gl/react-google-maps";

const Register = (props) => {
    const { types } = props;
    
    // 初期座標を設定
    const defaultLocation = { lat: 34.727593, lng: 135.236115 };  
    const [markerPosition, setMarkerPosition] = useState(null);

    const { data, setData, post } = useForm({
        name: '',
        latitude: defaultLocation.lat,
        longitude: defaultLocation.lng,
        address: '',
        parking_type_id: '',
    });

    // 地図クリック時にピンを表示＆座標を取得
    const handleMapClick = async (ev) => {
        const { lat, lng } = ev.detail.latLng;
        setMarkerPosition({ lat, lng });
        setData("latitude", lat);
        setData("longitude", lng);

        // Google Maps Geocoding APIで住所取得
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const formattedAddress = data.results[0].formatted_address;
            setData("address", formattedAddress); // フォームデータにも入れておく
        } else {
            setData("address", "住所が見つかりませんでした");
        }
    };

    const handleSendLocations = (e) => {
        e.preventDefault();
        post("/locations");
    };

    console.log("選択した座標:", data);

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                駐車場情報の登録
            </h2>
        }>
            <Head title="駐車場情報の登録" />
            <div className="p-12 mx-auto">
                {/* Googleマップ表示 */}
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <Map
                        style={{ width: "100%", height: "500px" }}
                        defaultZoom={13}
                        defaultCenter={defaultLocation}
                        mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                        onClick={handleMapClick}  // クリックでピンを配置
                    >
                        {/* クリックした場所にピンを表示 */}
                        {markerPosition && (
                            <AdvancedMarker position={markerPosition}>
                                <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
                            </AdvancedMarker>
                        )}
                    </Map>
                </APIProvider>

                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={handleSendLocations} className="space-y-6">
                        {[
                            { label: "駐車場名(空欄可)", name: "name", type: "text", readOnly: false },
                            { label: "緯度", name: "latitude", type: "number", step: "0.000001", readOnly: true },
                            { label: "経度", name: "longitude", type: "number", step: "0.000001", readOnly: true },
                            { label: "住所", name: "address", type: "text", readOnly: true },
                        ].map((({ label, name, type, step, readOnly })=> (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700">{label}</label>
                                <input
                                    type={type}
                                    step={step}
                                    value={data[name]}
                                    onChange={e => setData(name, e.target.value)}
                                    readOnly={readOnly}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                        )))}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">駐車場の種類</label>
                            <select 
                                onChange={e => setData("parking_type_id", e.target.value)}
                                className="border rounded-md p-2 w-full"
                            >
                                <option value="">選択しない</option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-between items-center">
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md"
                            >
                                登録
                            </button>

                            <Link
                                href="/locations"
                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md shadow-md"
                            >
                                戻る
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
};

export default Register;
