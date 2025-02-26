import React from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, router } from "@inertiajs/react";

const Show = (props) => {
    console.log(props); // ここで props の中身を確認

    const { location, auth, is_registered, basic_fees, mfods, mfoets, mfwps } = props;
    const { post } = useForm();

    const handleRegisterRecord = () => {
        post(`/locations/${location.id}`, {
            onSuccess: () => router.reload(), // 成功後にリロード
            onError: (errors) => alert(`登録に失敗しました: ${errors.message}`),
        });
    };

    const handleUnregisterRecord = () => {
        router.delete(`/locations/${location.id}/unregister`, {
            onSuccess: () => alert("駐車場所の登録を解除しました"),
            onError: (errors) => alert(`解除に失敗しました: ${errors.message}`),
        });
    };

    return (
        <Authenticated user={auth.user}>
            <div className="p-12">
                <p>緯度 {location.latitude}</p>
                <p>経度 {location.longitude}</p>
                <p>種類 {location.parking_type?.name ?? "未登録"}</p>

                <div className="my-6">
                    {/* 駐車場の登録状況 */}
                    {is_registered ? (
                        <p className="text-green-600">登録済み</p>
                    ) : (
                        <button
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={handleRegisterRecord}
                        >
                            駐車場所を登録
                        </button>
                    )}
                </div>

                <div className="my-6">
                    <button
                        className="p-1 bg-purple-300 hover:bg-purple-400 rounded-md"
                        onClick={() =>
                            router.delete(`/locations/${location.id}`, {
                                onBefore: () => confirm("本当に削除しますか？"),
                            })
                        }
                    >
                        delete
                    </button>
                </div>

                <div className="my-6">
                    {props.is_registered && (
                        <button
                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={handleUnregisterRecord}
                        >
                            駐車場所を解除
                        </button>
                    )}
                </div>

                <div className="my-6">
                    <Link href={`/locations/${location.id}/edit`}>駐車場の位置・種類の変更</Link>
                </div>

                <div className="my-6">
                    {/* 基本料金の表示 */}
                    <Link href={`/locations/${location.id}/basicfees`}>基本料金の詳細</Link>
                    {basic_fees.map((fee) => (
                        <div key={fee.id}>
                            <h2>{fee.start_time}~{fee.end_time}</h2>
                            <p>{fee.duration}分{fee.fee}円</p>
                        </div>
                    ))}
                </div>

                <div className="my-6">
                    {/* 当日最大料金の表示 */}
                    <Link href={`/locations/${location.id}/mfods`}>当日最大料金の詳細</Link>
                    {mfods.map((fee) => (
                        <div key={fee.id}>
                            <h2>当日に出庫</h2>
                            <p>最大{fee.max_fee}円</p>
                        </div>
                    ))}
                </div>

                <div className="my-6">
                    {/* 入庫後時間制最大料金の表示 */}
                    <Link href={`/locations/${location.id}/mfoets`}>入庫後時間制最大料金の詳細</Link>
                    {mfoets.map((fee) => (
                        <div key={fee.id}>
                            <h2>{fee.limit_time}時間</h2>
                            <p>最大{fee.max_fee}円</p>
                        </div>
                    ))}
                </div>

                <div className="my-6">
                    {/* 時間帯内最大料金の表示 */}
                    <Link href={`/locations/${location.id}/mfwps`}>時間帯内最大料金の詳細</Link>
                    {mfwps.map((fee) => (
                        <div key={fee.id}>
                            <h2>{fee.start_time}~{fee.end_time}</h2>
                            <p>最大{fee.max_fee}円</p>
                        </div>
                    ))}
                </div>

                <div className="my-6">
                    <Link href="/locations">戻る</Link>
                </div>
            </div>
        </Authenticated>
    );
};

export default Show;
