import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const EditBasicFees = (props) => {
    const{max_fee} = props;
    const { data, setData, put, errors } = useForm({
        max_fee: max_fee.max_fee,
        start_time: max_fee.start_time,
        end_time: max_fee.end_time,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/locations/${max_fee.parking_location_id}/mfwps/${max_fee.id}`, data);
    };
    console.log(max_fee)

    return(
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                時間帯内最大料金の設定
            </h2>
        }>
            <div className="p-12">
                <form onSubmit={submit}>
                    <div>
                        <label>料金(円)</label>
                        <input
                            type="number"
                            value={data.max_fee}
                            onChange={e => setData('max_fee', e.target.value)}
                        />
                        {errors.max_fee && <div>{errors.max_fee}</div>}
                    </div>

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

                    <button type="submit">
                        更新
                    </button>
                </form>
            </div>
        </Authenticated>
    )
}

export default EditBasicFees;