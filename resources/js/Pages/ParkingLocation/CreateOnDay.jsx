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
            <div className="p-12 max-w-lg mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {[
                            { label: "料金(円)", name: "max_fee", type: "number" },
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

                        <div className="flex justify-between items-center">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md">
                                設定
                            </button>
                            <Link
                                href={`/locations/${location.id}/mfods`}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                戻る
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    )
}

export default SettingOnDays;
