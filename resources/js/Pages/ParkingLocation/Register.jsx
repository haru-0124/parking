import React from "react";
import { Link, useForm } from '@inertiajs/react';
import Authenticated from "@/Layouts/AuthenticatedLayout";

const Register = (props) => {
    const {types} = props;
    const {data, setData, post} = useForm({
        latitude: 0.0,
        longitude: 0.0,
        parking_types_id: '',
    })

    const handleSendLocations = (e) => {
        e.preventDefault();
        post("/locations");
    }

    console.log(data);
    return (
            <Authenticated user={props.auth.user} header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Register
                    </h2>
                }>

                <div className="p-12">

                    <form onSubmit={handleSendLocations}>
                        <div>
                            <h2>Latitude</h2>
                            <input type="number" placeholder="緯度" onChange={(e) => setData("latitude", parseFloat(e.target.value) || 0)}/>
                        </div>                    

                        <div>
                            <h2>Longitude</h2>
                            <input type="number" placeholder="経度" onChange={(e) => setData("longitude", parseFloat(e.target.value) || 0)}/>
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

                        <button type="submit" className="p-1 bg-purple-300 haver:bg-purple-400 rounded-md">send</button>
                    </form>
                    <Link href="/locations">戻る</Link>
                </div>

            </Authenticated>
            );
    }

export default Register;