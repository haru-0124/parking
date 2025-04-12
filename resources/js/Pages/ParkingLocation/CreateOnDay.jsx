import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const SettingOnDays = (props) => {
    const { data, setData, post, errors } = useForm({
        max_fee: '',
    });

    const { location } = props;

    const submit = (e) => {
        e.preventDefault();
        post(`/locations/${location.id}/mfods`, data);
    };

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                当日最大料金の設定
            </h2>
        }>
            <div className="p-12 max-w-2xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">料金(円)</label>
                            <input
                                type="number"
                                value={data.max_fee}
                                onChange={e => setData('max_fee', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.max_fee && <div className="text-red-500 text-sm">{errors.max_fee}</div>}
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md shadow-md">
                            料金を設定
                        </button>
                    </form>
                    <Link
                        href={`/locations/${location.id}/mfods`}
                        className="block text-center w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md shadow-md mt-4"
                    >
                        戻る
                    </Link>
                </div>
            </div>
        </Authenticated>
    )
}

export default SettingOnDays;
