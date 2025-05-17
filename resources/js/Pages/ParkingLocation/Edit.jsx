import React from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";

const Edit = (props) => {
    const { location, types } = props;
    const { data, setData, put, errors } = useForm({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        parking_type_id: location.parking_type_id
    });

    const handleSendLocations = (e) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    };

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                駐車場情報の編集
            </h2>
        }>
            <Head title="駐車場情報の編集" />
            <div className="p-12 max-w-lg mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={handleSendLocations} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">駐車場名</label>
                            <input 
                                type="text"
                                placeholder="駐車場名" 
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">緯度</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                placeholder="緯度" 
                                value={data.latitude} 
                                onChange={(e) => setData("latitude", parseFloat(e.target.value) || 0)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.latitude && <span className="text-red-500 text-sm">{errors.latitude}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">経度</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                placeholder="経度" 
                                value={data.longitude} 
                                onChange={(e) => setData("longitude", parseFloat(e.target.value) || 0)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.longitude && <span className="text-red-500 text-sm">{errors.longitude}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">住所</label>
                            <input 
                                type="text"
                                placeholder="住所" 
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">駐車場タイプ</label>
                            <select 
                                onChange={e => setData("parking_type_id", e.target.value)} 
                                value={data.parking_type_id || ""} 
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                {location.parking_type_id ? (
                                    <>
                                        <option value={location.parking_type_id} disabled>
                                            {location.parking_type.name}
                                        </option>
                                        {types.map((type) => (
                                            type.id !== location.parking_type_id && (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            )
                                        ))}
                                        <option value="">選択しない</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="" disabled>選択しない</option>
                                        {types.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="flex justify-between">
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md"
                            >
                                更新
                            </button>
                            <Link 
                                href={`/locations/${location.id}`} 
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
}

export default Edit;
