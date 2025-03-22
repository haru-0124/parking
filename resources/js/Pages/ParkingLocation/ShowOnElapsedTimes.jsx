import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, router } from "@inertiajs/react";

const ShowOnElapsedTimes = (props) => {
    const { max_fees } = props;
    const { location } = props;
    console.log(props);

    return (
        <Authenticated user={props.auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                入庫後時間制最大料金
            </h2>
        }>
            
            <div className="p-12">
                <h1>入庫後時間制最大料金</h1>

                {/* max_feesが空の場合の処理 */}
                {max_fees.length > 0 ? (
                    max_fees.map((fee) => (
                        <div key={fee.id} className="mb-4 p-4 border rounded shadow">
                            <h2 className="text-lg font-bold">入庫後 {fee.limit_time} 時間まで</h2>
                            <p className="text-gray-700">最大 {fee.max_fee} 円</p>

                            <div className="mt-2">
                                <Link 
                                    href={`/locations/${location.id}/mfoets/${fee.id}/edit`} 
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    編集
                                </Link>
                                
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => {
                                        if (confirm("本当に削除しますか？")) {
                                            router.delete(`/locations/${location.id}/mfoets/${fee.id}`);
                                        }
                                    }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">時間制最大料金が設定されていません。</p>
                )}

                <div className="mt-4">
                    <Link 
                        href={`/locations/${location.id}/mfoets/register`}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        作成
                    </Link>
                </div>

                <div className="mt-4">
                    <Link 
                        href={`/locations/${location.id}`} 
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        戻る
                    </Link>
                </div>
            </div>
        </Authenticated>
    );
}

export default ShowOnElapsedTimes;
