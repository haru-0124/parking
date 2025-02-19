import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, router } from '@inertiajs/react';

const Show = (props) => {
    const { location } = props;
    const handleDeleteLocation = (id) => {
      router.delete(`/locations/${id}`, {
        onBefore: () => confirm("本当に削除しますか？"),
      });
    };

    return (
        <Authenticated user={props.auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Show
                </h2>
            }>
            
            <div className="p-12">
                <p>緯度 { location.latitude }</p>
                <p>経度 { location.longitude}</p>
                <p>種類 {location.parking_type?.name ?? "未登録"}</p>
                <div>
                    <Link href={`/locations/${location.id}/edit`}>編集</Link>
                </div>
                <div>
                  <button 
                    className="p-1 bg-purple-300 hover:bg-purple-400 rounded-md" 
                    onClick={() => handleDeleteLocation(location.id)}
                >
                    delete
                  </button>
                </div>
                <div>
                    <Link href="/locations">戻る</Link>
                </div>
            </div>
            
        </Authenticated>
        );
}

export default Show;