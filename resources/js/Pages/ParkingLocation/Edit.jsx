import React from "react";
import { Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";

const Edit = (props) => {
    const {location} = props;
    const {types} = props;
    const {data, setData, put} = useForm({
        latitude: location.latitude,
        longitude: location.longitude,
        parking_types_id: location.parking_types_id
    })

    const handleSendLocations = (e) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    }

    console.log(data);
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
                        <input type="number" placeholder="緯度" value={data.latitude} onChange={(e) => setData("latitude", parseFloat(e.target.value) || 0)}/>
                        <span className="text-red-600">{props.errors.title}</span>
                    </div>                    
                    
                    <div>
                        <h2>longitude</h2>
                        <input type="number" placeholder="経度" value={data.longitude} onChange={(e) => setData("longitude", parseFloat(e.target.value) || 0)}/>
                        <span className="text-red-600">{props.errors.body}</span>
                    </div>
                    
                    <div>
                        <h2>ParkingType</h2>
                        <select onChange={e => setData("parking_types_id", e.target.value)}>
                            <option value="">選択しない</option>
                            {types.map((type) => (
                                <option value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="p-1 bg-purple-300 hover:bg-purple-400 rounded-md">send</button>
                </form>
                
                <Link href="/locations">戻る</Link>
            </div>
            
        </Authenticated>
        );
}

export default Edit;
