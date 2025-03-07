import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {Link, router} from "@inertiajs/react";

const ShowOnDays = (props) => {
    const { max_fees } = props;
    console.log(props);

    return (
        <Authenticated user={props.auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    当日最大料金
                </h2>
            }>
            
            <div className="p-12">
                <h1>当日最大料金</h1>

                { max_fees.map((fee) => (
                    <div key={fee.id}>
                        <h2>当日に出庫</h2>
                        <p>最大{fee.max_fee}円</p>
                        <Link 
                            href={`/locations/${fee.parking_location_id}/mfods/${fee.id}/edit`} 
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                        >
                            編集
                        </Link>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => {
                                if (confirm("本当に削除しますか？")) {
                                    router.delete(`/locations/${fee.parking_location_id}/mfods/${fee.id}`);
                                }
                            }}
                        >
                            削除
                        </button>
                    </div>
                ))}

                <div>
                    <Link href={`/locations/${max_fees[0].parking_location_id}/mfods/register`}>基本料金を設定</Link>
                </div>

                <div>
                    <Link href={`/locations/${max_fees[0].parking_location_id}`}>戻る</Link>
                </div>
            </div>
        
        </Authenticated>
    );
}

export default ShowOnDays;