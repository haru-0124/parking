import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useForm, Link } from "@inertiajs/react";

const EditBasicFee = (props) => {
    const { basic_fee } = props;
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
            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                基本料金の編集
            </h2>
        }>
            <div className="p-12 max-w-lg mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 開始時間 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">開始時間</label>
                            <input
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData("start_time", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time}</p>}
                        </div>

                        {/* 終了時間 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">終了時間</label>
                            <input
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData("end_time", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time}</p>}
                        </div>

                        {/* 時間単位 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">時間単位（分）</label>
                            <input
                                type="number"
                                value={data.duration}
                                onChange={(e) => setData("duration", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
                        </div>

                        {/* 料金 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">料金（円）</label>
                            <input
                                type="number"
                                value={data.fee}
                                onChange={(e) => setData("fee", e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.fee && <p className="text-red-500 text-sm">{errors.fee}</p>}
                        </div>

                        {/* 最大料金 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">最大料金（円・空欄可）</label>
                            <input
                                type="number"
                                value={data.max_fee ?? ''}
                                onChange={e => setData('max_fee', e.target.value === '' ? null : e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.max_fee && <p className="text-red-500 text-sm">{errors.max_fee}</p>}
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
                                href={`/locations/${basic_fee.parking_location_id}/basicfees`} 
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
};

export default EditBasicFee;
