import React from "react";
import { Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";

const Edit = (props) => {
    const {location} = props;
    const {types} = props;
    const {data, setData, put} = useForm({
        latitude: location.latitude,
        longitude: location.longitude,
        parking_type_id: location.parking_type_id
    })

    const handleSendLocations = (e) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    }

    console.log(props);
    return (
        <Authenticated user={props.auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit
                </h2>
            }>
            
            <div className="p-12">
                <form onSubmit={handleSendLocations}>
                    <div>
                        <h2>latitude</h2>
                        <input type="number" step="0.01" placeholder="緯度" value={data.latitude} onChange={(e) => setData("latitude", parseFloat(e.target.value) || 0)}/>
                        <span className="text-red-600">{props.errors.title}</span>
                    </div>                    
                    
                    <div>
                        <h2>longitude</h2>
                        <input type="number" step="0.01" placeholder="経度" value={data.longitude} onChange={(e) => setData("longitude", parseFloat(e.target.value) || 0)}/>
                        <span className="text-red-600">{props.errors.body}</span>
                    </div>
                    
                    <div>
                    <h2>ParkingType</h2>
                    <select onChange={e => setData("parking_type_id", e.target.value)} value={data.parking_type_id || ""}>
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
                                <option value="" disabled>
                                    選択しない
                                </option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>

                    </div>
                    <button type="submit" className="p-1 bg-purple-300 hover:bg-purple-400 rounded-md">send</button>
                </form>
                
                <Link href={`/locations/${location.id}`}>戻る</Link>
            </div>
            
        </Authenticated>
        );
}

export default Edit;
