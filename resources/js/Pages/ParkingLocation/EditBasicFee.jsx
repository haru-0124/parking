import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm, Link } from "@inertiajs/react";

const EditBasicFee = (props) => {
    const {basic_fee} = props
    const { data, setData, put, processing, errors } = useForm({
        start_time: basic_fee.start_time,
        end_time: basic_fee.end_time,
        duration: basic_fee.duration,
        fee: basic_fee.fee,
        max_fee: basic_fee.max_fee,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/locations/${basic_fee.parking_location_id}/basicfees/${basic_fee.id}`);
    };

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                基本料金の編集
            </h2>
        }>
            <div className="p-12">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>開始時間</label>
                        <input
                            type="time"
                            value={data.start_time}
                            onChange={(e) => setData("start_time", e.target.value)}
                            className="border p-2"
                        />
                        {errors.start_time && <p className="text-red-500">{errors.start_time}</p>}
                    </div>

                    <div>
                        <label>終了時間</label>
                        <input
                            type="time"
                            value={data.end_time}
                            onChange={(e) => setData("end_time", e.target.value)}
                            className="border p-2"
                        />
                        {errors.end_time && <p className="text-red-500">{errors.end_time}</p>}
                    </div>

                    <div>
                        <label>時間単位（分）</label>
                        <input
                            type="number"
                            value={data.duration}
                            onChange={(e) => setData("duration", e.target.value)}
                            className="border p-2"
                        />
                        {errors.duration && <p className="text-red-500">{errors.duration}</p>}
                    </div>

                    <div>
                        <label>料金（円）</label>
                        <input
                            type="number"
                            value={data.fee}
                            onChange={(e) => setData("fee", e.target.value)}
                            className="border p-2"
                        />
                        {errors.fee && <p className="text-red-500">{errors.fee}</p>}
                    </div>

                    <div>
                        <label>最大料金(円・空欄可)</label>
                        <input
                            type="number"
                            value={data.max_fee ?? ''}
                            onChange={e => setData('max_fee', e.target.value === '' ? null : e.target.value)}
                        />
                        {errors.max_fee && <div>{errors.max_fee}</div>}
                    </div>

                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4" disabled={processing}>
                        更新
                    </button>
                </form>

                <div>
                    <Link href={`/locations/${basic_fee.parking_location_id}/basicfees`}>戻る</Link>
                </div>
            </div>
        </Authenticated>
    );
};

export default EditBasicFee;
