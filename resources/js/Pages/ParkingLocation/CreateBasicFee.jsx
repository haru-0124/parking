import React, { useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const SettingBasicFees = ({ auth, location }) => {
    const { data, setData, post, processing, errors } = useForm({
        start_time: '',
        end_time: '',
        duration: '',
        fee: '',
        max_fee: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/locations/${location.id}/basicfees`, data);
    };

    return (
        <Authenticated user={auth.user} header={
            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                基本料金の設定
            </h2>
        }>
            <div className="p-12 max-w-2xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {[
                            { label: "開始時間", name: "start_time", type: "time" },
                            { label: "終了時間", name: "end_time", type: "time" },
                            { label: "時間(分)", name: "duration", type: "number" },
                            { label: "料金(円)", name: "fee", type: "number" }
                        ].map(({ label, name, type }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700">{label}</label>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700">最大料金(円・空欄可)</label>
                            <input
                                type="number"
                                value={data.max_fee ?? ''}
                                onChange={e => setData('max_fee', e.target.value === '' ? null : Number(e.target.value))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.max_fee && (
                                <div className="text-red-500 text-sm" aria-live="polite">
                                    {errors.max_fee}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md shadow-md ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={processing}
                        >
                            料金を設定
                        </button>
                    </form>

                    <Link
                        href={`/locations/${location.id}/basicfees`}
                        className="block text-center w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md shadow-md mt-4"
                    >
                        戻る
                    </Link>
                </div>
            </div>
        </Authenticated>
    );
};

export default SettingBasicFees;
