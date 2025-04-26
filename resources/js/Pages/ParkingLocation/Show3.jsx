import React, { useState } from "react"; // useStateをインポート
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, router } from "@inertiajs/react";
import { calculateParkingFee } from '@/utils/calculateParkingFee';

const Show = (props) => {
    console.log(props); // ここで props の中身を確認

    const { location, auth, record, is_registered, basic_fees, mfods, mfoets } = props;
    const { post } = useForm();
    const [calculatedFee, setCalculatedFee] = useState(0); // 計算された料金を保持
    const formatDateTimeLocal = (dateString) => {
        let date;

        if (dateString) {
          // record.created_at がある場合、その日時を使う
          date = new Date(dateString);
        } else {
          // record.created_at が null または undefined の場合、日本時間の現在時刻を取得
          const nowJST = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
          date = new Date(nowJST);
        }
      
        // 日本時間（JST, UTC+9）でフォーマット
        return date.toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // 24時間表記
        }).replace(/\//g, "-").replace(" ", "T").slice(0, 16);
      };
      
    // 初期値を設定（record?.created_at が無ければ現在時刻）
    const [startTime, setStartTime] = useState(formatDateTimeLocal(record?.created_at));

    const [endTime, setEndTime] = useState(""); // 終了時間の状態を管理

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
    
    // Show.jsx
    const handleBackClick = () => {
        // 現在の駐車場の位置を保存
        localStorage.setItem("lastLocation", JSON.stringify({
        lat: location.latitude,
        lng: location.longitude
        }));
    };
    
    const [showActions, setShowActions] = useState(false);
    
    return (
        <Authenticated user={auth.user} header={
            <div className="flex items-center justify-start">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {location.name ?? "名称未登録の駐車場"}
                </h2>
                <nav className="flex space-x-4 ml-4">
                    <Link href="/locations" onClick={handleBackClick}className="font-semibold text-xl text-gray-800 leading-tight">ホーム</Link>
                </nav>
                {is_registered && (
                <p className="font-semibold text-green-600 text-sm ml-4">現在あなたが駐車中</p>
                )}
            </div> 
        }>
        <div className="p-12 space-y-8">
            {/* 駐車場情報 */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4">🚗 駐車場情報</h3>
                <div className="grid grid-cols-1 gap-4 mb-4 break-words">
                    <p className="whitespace-normal break-words w-full">
                        <strong>駐車場タイプ:</strong>
                        {location.parking_type?.name ?? "未登録"}
                        {location.parking_type?.description && ` (${location.parking_type.description})`}
                    </p>
                </div>

                <div className="mt-4">
                    {is_registered ? (
                        <button
                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={handleUnregisterRecord}
                        >
                            駐車を終了する
                        </button>
                    ) : (
                        <button
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={handleRegisterRecord}
                        >
                            ここに駐車する
                        </button>
                    )}

                    {/* ▼アイコン風のトグルボタン */}
                    <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                                aria-label="アクション表示切替"
                            >
                                {showActions ? (
                                    <span className="text-2xl">▲</span>
                                ) : (
                                    <span className="text-2xl">▼</span>
                                )}
                            </button>
                        </div>

                        {/* 編集・削除ボタン：展開状態のときのみ表示 */}
                        {showActions && (
                            <div className="mt-4 flex justify-start gap-2">
                                <Link
                                    href={`/locations/${location.id}/edit`}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    駐車場情報の編集
                                </Link>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => {
                                        if (confirm("本当に削除しますか？")) {
                                            router.delete(`/locations/${location.id}`);
                                        }
                                    }}
                                >
                                    駐車場の削除
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 料金情報 */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold mb-4">💴 料金情報</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 基本料金 */}
                        <div>
                            <Link href={`/locations/${location.id}/basicfees`} 
                                className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
                                基本料金の詳細
                            </Link>
                            <div className="mt-4 space-y-4">
                                {basic_fees.map((fee) => (
                                    <div key={fee.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                        <h2 className="text-lg font-semibold text-gray-700">{fee.start_time} ~ {fee.end_time}</h2>
                                        <p className="text-gray-600">{fee.duration}分 / <span className="text-blue-600 font-bold">{fee.fee}円</span></p>
                                        {fee.max_fee && (
                                            <p className="text-red-500 font-bold">最大: {fee.max_fee}円</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
    
                        {/* 当日最大料金 */}
                        <div>
                            <Link href={`/locations/${location.id}/mfods`} 
                                className="inline-block bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md">
                                当日最大料金の詳細
                            </Link>
                            <div className="mt-4 space-y-4">
                                {mfods.map((fee) => (
                                    <div key={fee.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                                        <h2 className="text-lg font-semibold text-gray-700">当日に出庫</h2>
                                        <p className="text-red-500 font-bold">最大: {fee.max_fee}円</p>
                                    </div>
                                ))}
                            </div>
                        </div>
    
                        {/* 入庫後時間制最大料金 */}
                        <div>
                            <Link href={`/locations/${location.id}/mfoets`} 
                                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md">
                                入庫後時間制最大料金の詳細
                            </Link>
                            <div className="mt-4 space-y-4">
                                {mfoets.map((fee) => (
                                    <div key={fee.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                                        <h2 className="text-lg font-semibold text-gray-700">{fee.limit_time}時間</h2>
                                        <p className="text-red-500 font-bold">最大: {fee.max_fee}円</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* 料金計算 */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold mb-4">🧮 駐車料金計算</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-2">開始日時:</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border border-gray-400 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">終了日時:</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full border border-gray-400 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="my-6">
                        <button
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            onClick={() => {
                                const parkingFee = calculateParkingFee(startTime, endTime, basic_fees, mfods, mfoets);
                                setCalculatedFee(parkingFee);
                            }}
                        >
                            駐車料金を計算
                        </button>
                    </div>
                    <div>
                        <p>料金: {calculatedFee}円</p>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
export default Show;