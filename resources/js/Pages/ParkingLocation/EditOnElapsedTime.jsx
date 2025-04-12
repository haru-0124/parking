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
                    入庫後時間制最大料金の設定
                </h2>
            }
        >
            <div className="p-12 max-w-lg mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* 最大料金 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">料金（円）</label>
                            <input
                                type="number"
                                value={data.max_fee}
                                onChange={e => setData('max_fee', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.max_fee && (
                                <p className="text-red-500 text-sm">{errors.max_fee}</p>
                            )}
                        </div>

                        {/* 時間制限 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">時間（時間）</label>
                            <input
                                type="number"
                                value={data.limit_time}
                                onChange={e => setData('limit_time', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.limit_time && (
                                <p className="text-red-500 text-sm">{errors.limit_time}</p>
                            )}
                        </div>

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
