import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {Link, router} from "@inertiajs/react";

const ShowBasicFees = (props) => {
    const { basic_fees} = props;
    console.log(props);

    return (
        <Authenticated user={props.auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    BasicFees
                </h2>
            }>
            
            <div className="p-12">
                <h1>BasicFee</h1>

                { basic_fees.map((fee) => (
                    <div key={fee.id}>
                        <h2>{ fee.start_time }~{fee.end_time}</h2>
                        <p>{ fee.duration }分{ fee.fee }円</p>

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
                ))}

                <div>
                    <Link href={`/locations/${basic_fees[0].parking_location_id}/basicfees/register`}>基本料金を設定</Link>
                </div>
            </div>
        
        </Authenticated>
    );
}

export default ShowBasicFees;