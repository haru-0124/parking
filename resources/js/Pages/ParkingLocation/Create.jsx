import React, { useState } from "react";
import { Link, useForm } from '@inertiajs/react';
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
                Register
            </h2>
        }>
            <div className="p-12">

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

                <form onSubmit={handleSendLocations} className="mt-4">
                    <div>
                        <h2>駐車場名</h2>
                        <input 
                            type="string" 
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    <div>
                        <h2>緯度</h2>
                        <input 
                            type="number" 
                            step="0.000001" 
                            value={data.latitude}
                            readOnly
                            className="border rounded-md p-2 w-full"
                        />
                    </div>                    

                    <div>
                        <h2>経度</h2>
                        <input 
                            type="number" 
                            step="0.000001" 
                            value={data.longitude}
                            readOnly
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    <div>
                        <h2>住所</h2>
                        <input 
                            type="text"
                            value={data.address}
                            readOnly
                            className="border rounded-md p-2 w-full"
                        />
                    </div>


                    <div>
                        <h2>駐車場の種類</h2>
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

                    <button 
                        type="submit" 
                        className="p-2 mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-md w-full"
                    >
                        登録
                    </button>
                </form>

                <div className="mt-4">
                    <Link href="/locations" className="text-blue-500">戻る</Link>
                </div>
            </div>
        </Authenticated>
    );
};

export default Register;
