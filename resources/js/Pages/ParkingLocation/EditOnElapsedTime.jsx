import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const EditOnElapsedTimes = (props) => {
    const { max_fee } = props;
    const { data, setData, put, processing, errors } = useForm({
        max_fee: max_fee.max_fee,
        limit_time: max_fee.limit_time,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/locations/${max_fee.parking_location_id}/mfoets/${max_fee.id}`, data);
    };

    return (
        <Authenticated 
            user={props.auth.user} 
            header={
                <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                    入庫後時間制最大料金の編集
                </h2>
            }
        >
            <div className="p-12 max-w-lg mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {[
                            { label: "料金(円)", name: "max_fee", type: "number"},
                            { label: "時間(時間)", name: "limit_time", type: "number"},
                        ].map(({ label, name, type}) => (
                            <div key={name}>
                                <lavel className="block text-sm font-medium text-gray-700">{label}</lavel>
                                <input
                                    type={type}
                                    value={data[name]}
                                    onChange={e => setData(name, e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors[name] && (
                                    <div className="text-red-500 text-sm" aria-live="polite">
                                        {errors[name]}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ボタンとリンク */}
                        <div className="flex justify-between items-center">
                            <button 
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md"
                                disabled={processing}
                            >
                                更新
                            </button>
                            <Link 
                                href={`/locations/${max_fee.parking_location_id}/mfoets`}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                戻る
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}

export default EditOnElapsedTimes;
