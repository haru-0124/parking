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
                        {[
                            { label: "開始時間", name: "start_time", type: "time" },
                            { label: "終了時間", name: "end_time", type: "time" },
                            { label: "時間(分)", name: "duration", type: "number" },
                            { label: "料金(円)", name: "fee", type: "number" },
                            { label: "最大料金(円・空欄可)", name: "max_fee", type: "number", optional: true }
                        ].map(({ label, name, type }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700">{label}</label>
                                <input
                                    type={type}
                                    value={data[name] ?? ''}
                                    onChange={e =>
                                        setData(name, e.target.value === '' && optional ? null : e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                />
                                {errors[name] && (
                                    <p className="text-red-500 text-sm">{errors[name]}</p>
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
