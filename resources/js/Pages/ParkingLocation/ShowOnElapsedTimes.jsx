import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {Link, router} from "@inertiajs/react";

const ShowOnElapsedTimes = (props) => {
    const { max_fees } = props;
    console.log(props);

    return (
        <Authenticated user={props.auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    入庫後時間制最大料金
                </h2>
            }>
            
            <div className="p-12">
                <h1>入庫後時間制最大料金</h1>

                { max_fees.map((fee) => (
                    <div key={fee.id}>
                        <h2>入庫後{fee.limit_time}時間まで</h2>
                        <p>最大{fee.max_fee}円</p>
                        <Link 
                            href={`/locations/${fee.parking_location_id}/mfoets/${fee.id}/edit`} 
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                        >
                            編集
                        </Link>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => {
                                if (confirm("本当に削除しますか？")) {
                                    router.delete(`/locations/${fee.parking_location_id}/mfoets/${fee.id}`);
                                }
                            }}
                        >
                            削除
                        </button>
                    </div>
                ))}

                <div>
                    <Link href={`/locations/${max_fees[0].parking_location_id}/mfoets/register`}>基本料金を設定</Link>
                </div>

                <div>
                    <Link href={`/locations/${max_fees[0].parking_location_id}`}>戻る</Link>
                </div>
            </div>
        
        </Authenticated>
    );
}

export default ShowOnElapsedTimes;