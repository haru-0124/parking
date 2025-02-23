import React, { useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const SettingBasicFees = (props) => {
    const { data, setData, post, errors } = useForm({
        start_time: '',
        end_time: '',
        duration: '',
        fee: '',
    });

    const{location} = props;

    const submit = (e) => {
        e.preventDefault();
        post(`/locations/${location.id}/basicfees`, data);
    };

    return(
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                基本料金の設定
            </h2>
        }>
            <div className="p-12">
                <form onSubmit={submit}>
                    <div>
                        <label>開始時間</label>
                        <input
                            type="time"
                            value={data.start_time}
                            onChange={e => setData('start_time', e.target.value)}
                        />
                        {errors.start_time && <div>{errors.start_time}</div>}
                    </div>

                    <div>
                        <label>終了時間</label>
                        <input
                            type="time"
                            value={data.end_time}
                            onChange={e => setData('end_time', e.target.value)}
                        />
                        {errors.end_time && <div>{errors.end_time}</div>}
                    </div>

                    <div>
                        <label>時間(分)</label>
                        <input 
                            type="number"
                            value={data.duration}
                            onChange={e => setData('duration', e.target.value)}
                        />
                        {errors.duration && <div>{errors.duration}</div>}
                    </div>

                    <div>
                        <label>料金(円)</label>
                        <input
                            type="number"
                            value={data.fee}
                            onChange={e => setData('fee', e.target.value)}
                        />
                        {errors.fee && <div>{errors.fee}</div>}
                    </div>

                    <button type="submit">
                        料金を設定
                    </button>
                </form>
            </div>
        </Authenticated>
    )
}

export default SettingBasicFees;