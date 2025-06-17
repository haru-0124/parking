import React, { useEffect, useState } from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from "@vis.gl/react-google-maps";

const EditLocation = (props) => {
    const { location, types } = props;

    const defaultLocation = {
        lat: Number(location.latitude) || 34.727593,
        lng: Number(location.longitude) || 135.236115
    };

    const [markerPosition, setMarkerPosition] = useState(defaultLocation);

    const { data, setData, put } = useForm({
        name: location.name || '',
        latitude: defaultLocation.lat,
        longitude: defaultLocation.lng,
        address: location.address || '',
        parking_type_id: location.parking_type_id || '',
    });

    // 地図クリック時に座標と住所を更新
    const handleMapClick = async (ev) => {
        const { lat, lng } = ev.detail.latLng;
        setMarkerPosition({ lat, lng });
        setData("latitude", lat);
        setData("longitude", lng);

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const result = await response.json();

        if (result.status === "OK" && result.results.length > 0) {
            const formattedAddress = result.results[0].formatted_address;
            setData("address", formattedAddress);
        } else {
            setData("address", "住所が見つかりませんでした");
        }
    };

    const handleUpdateLocation = (e) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    };

    const [showInfo, setShowInfo] = useState(false)

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                駐車場情報の編集
            </h2>
        }>
            <Head title="駐車場情報の編集" />
            <div className="p-12 mx-auto">
                {/* Google Map */}
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <Map
                        style={{ width: "100%", height: "500px" }}
                        defaultZoom={13}
                        defaultCenter={defaultLocation}
                        mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                        onClick={handleMapClick}
                    >
                        {markerPosition && (
                            <AdvancedMarker position={markerPosition}>
                                <Pin background={"#FBBC04"} glyphColor={"#000"} borderColor={"#000"} />
                            </AdvancedMarker>
                        )}
                    </Map>
                </APIProvider>

                <div className="bg-white shadow-lg rounded-2xl p-8 mt-6">
                    <form onSubmit={handleUpdateLocation} className="space-y-6">
                        {[ 
                            { label: "駐車場名(空欄可)", name: "name", type: "text", readOnly: false },
                            { label: "緯度", name: "latitude", type: "number", step: "0.000001", readOnly: true },
                            { label: "経度", name: "longitude", type: "number", step: "0.000001", readOnly: true },
                            { label: "住所", name: "address", type: "text", readOnly: true },
                        ].map(({ label, name, type, step, readOnly }) => (
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
                        ))}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                駐車場の種類
                                <button
                                    type="button"
                                    onClick={() => setShowInfo(true)}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                    title="駐車場の種類について"
                                >
                                    ℹ️
                                </button>
                            </label>
                            <select 
                                value={data.parking_type_id}
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

                            {/* モーダル */}
                            {showInfo && (
                                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                    <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                                        <h2 className="text-lg font-bold mb-2">駐車場の種類の説明</h2>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            {types.map((type) => (
                                                <li key={type.id}>
                                                    <strong>{type.name}:</strong> {type.description}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-right mt-4">
                                            <button
                                                onClick={() => setShowInfo(false)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                閉じる
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button 
                                type="submit" 
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md"
                            >
                                更新
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

export default EditLocation;
