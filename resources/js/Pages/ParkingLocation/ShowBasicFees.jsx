import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, router } from "@inertiajs/react";

const ShowBasicFees = (props) => {
    const { basic_fees } = props;
    const { location } = props;

    return (
        <Authenticated
            user={props.auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">基本料金</h2>}
        >
            <div className="p-12">
                <h1 className="text-2xl font-bold mb-4">基本料金</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {basic_fees.length > 0 ? (
                        basic_fees.map((fee) => (
                            <div key={fee.id} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold">
                                    {fee.start_time} ~ {fee.end_time}
                                </h2>
                                <p className="text-gray-700">{fee.duration}分 {fee.fee}円</p>
                                {fee.max_fee && <p className="text-gray-500">最大 {fee.max_fee}円</p>}
                                
                                <div className="mt-4 flex justify-between">
                                    <Link
                                        href={`/locations/${fee.parking_location_id}/basicfees/${fee.id}/edit`}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        編集
                                    </Link>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => {
                                            if (confirm("本当に削除しますか？")) {
                                                router.delete(`/locations/${fee.parking_location_id}/basicfees/${fee.id}`);
                                            }
                                        }}
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">基本料金が設定されていません。</p>
                    )}
                </div>

                <div className="mt-8">
                    <>
                        <Link 
                            href={`/locations/${location.id}/basicfees/register`}
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
                        >
                            基本料金を設定
                        </Link>
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

export default ShowBasicFees;
