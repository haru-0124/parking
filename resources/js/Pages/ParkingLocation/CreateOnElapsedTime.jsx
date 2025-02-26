import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const SettingOnElapsedTimes = (props) => {
    const { data, setData, post, errors } = useForm({
        max_fee: '',
        limit_time: '',
    });

    const{location} = props;
    console.log(props)

    const submit = (e) => {
        e.preventDefault();
        post(`/locations/${location.id}/mfoets`, data);
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
                        料金を設定
                    </button>
                </form>
            </div>
        </Authenticated>
    )
}

export default SettingOnElapsedTimes;