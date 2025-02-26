import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const EditOnDay = (props) => {
    const {max_fee} = props
    const { data, setData, put, errors } = useForm({
        max_fee: max_fee.max_fee,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/locations/${max_fee.parking_location_id}/mfods/${max_fee.id}`, data);
    };

    return(
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                当日最大料金の設定
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

                    <button type="submit">
                        更新
                    </button>
                </form>
            </div>
        </Authenticated>
    )
}

export default EditOnDay;