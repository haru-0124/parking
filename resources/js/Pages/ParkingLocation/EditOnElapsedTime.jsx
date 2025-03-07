import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const EditOnElapsedTimes = (props) => {
    const {max_fee} = props;
    const { data, setData, put, errors } = useForm({
        max_fee: max_fee.max_fee,
        limit_time: max_fee.limit_time,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/locations/${max_fee.parking_location_id}/mfoets/${max_fee.id}`, data);
    };

    return(
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                入庫後時間制最大料金の設定
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
                        <label>時間(時間)</label>
                        <input
                            type="number"
                            value={data.limit_time}
                            onChange={e => setData('limit_time', e.target.value)}
                        />
                        {errors.limit_time && <div>{errors.limit_time}</div>}
                    </div>

                    <button type="submit">
                        更新
                    </button>
                </form>

                <div>
                    <Link href={`/locations/${max_fee.parking_location_id}/mfoets`}>戻る</Link>
                </div>
            </div>
        </Authenticated>
    )
}

export default EditOnElapsedTimes;