import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, router } from "@inertiajs/react";

const ShowOnDays = (props) => {
    const { max_fees } = props;
    const { location } = props;

    return (
        <Authenticated
            user={props.auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    当日最大料金
                </h2>
            }
        >
            <div className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {max_fees.length > 0 && (
                        max_fees.map((fee) => (
                            <div key={fee.id} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold">当日に出庫</h2>
                                <p className="text-gray-700">最大 {fee.max_fee} 円</p>
                                
                                <div className="mt-4 flex justify-between">
                                    <Link
                                        href={`/locations/${location.id}/mfods/${fee.id}/edit`}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        ✏️編集
                                    </Link>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        onClick={() => {
                                            if (confirm("本当に削除しますか？")) {
                                                router.delete(`/locations/${location.id}/mfods/${fee.id}`);
                                            }
                                        }}
                                    >
                                        🗑削除
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <Link
                        href={`/locations/${location.id}/mfods/register`}
                        className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center hover:bg-gray-50 transition"
                    >
                        <span className="text-3xl mb-2">➕</span>
                        <span className="text-lg font-semibold text-blue-600">当日最大料金を追加</span>
                    </Link>
                </div>

                <div className="mt-8">
                    <>
                        <Link
                            href={`/locations/${location.id}`}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            戻る
                        </Link>
                    </>      
                </div>
            </div>
        </Authenticated>
    );
};

export default ShowOnDays;
