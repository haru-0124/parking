import React, { useState } from "react"; // useStateをインポート
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, router } from "@inertiajs/react";

const Show = (props) => {
    console.log(props); // ここで props の中身を確認

    const { location, auth, record, is_registered, basic_fees, mfods, mfoets, mfwps } = props;
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

    const calculateFee = () => {
        if (!startTime || !endTime) {
            alert("開始日、開始時間、終了日、終了時間を入力してください");
            return;
        }
    
        const start = new Date(startTime);
        const end = new Date(endTime);
        const parkingTime = (end - start) / (1000 * 60 * 60);
        console.log(`駐車時間${parkingTime}`);
    
        if (start >= end) {
            alert("開始日時は終了日時より前でなければなりません");
            return;
        }
    
        let totalFee = 0;
        let totalFeeOnDay = 0;
        let totalFeeOnElapsedTime = 0;
        let fragTime = 30;
        let fragTotal = 0;
    
        let current = new Date(start);
    
        while (current < end) {
            let currentTime = current.toLocaleTimeString("ja-JP", { hour12: false });
            let currentTimeInMinutes = parseInt(currentTime.slice(0, 2)) * 60 + parseInt(currentTime.slice(3, 5));
            
            console.log(new Date(current).toLocaleString("ja-JP", {
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false
              })); // ループごとにコピーして出力
            current.setMinutes(current.getMinutes() + fragTime);
            fragTotal += fragTime; // 入庫後時間制最大料金用
    
            basic_fees.forEach(fee => {
                let startTimeInMinutes = parseInt(fee.start_time.slice(0, 2)) * 60 + parseInt(fee.start_time.slice(3, 5));
                let endTimeInMinutes = parseInt(fee.end_time.slice(0, 2)) * 60 + parseInt(fee.end_time.slice(3, 5));
                if (fee.start_time < fee.end_time) {
                    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                        totalFee += fee.fee;
                        totalFeeOnElapsedTime += fee.fee;
                        totalFeeOnDay += fee.fee;
                    }
                } else {
                    if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes) {
                        totalFee += fee.fee;
                        totalFeeOnElapsedTime += fee.fee;
                        totalFeeOnDay += fee.fee;
                    }
                }
            });
    
            mfods.forEach(fee => {
                let daychange = new Date(current);
                daychange.setHours(0, fragTime);
                if (current < daychange) {
                    console.log(`当日最大料金確認${totalFeeOnDay}`);
                    if (totalFeeOnDay > fee.max_fee) {
                        console.log(`当日最大料金適用による差額${totalFeeOnDay - fee.max_fee}`);
                        totalFee -= totalFeeOnDay - fee.max_fee;
                        totalFeeOnDay = 0;
                        if (totalFeeOnElapsedTime > fee.max_fee) {
                            totalFeeOnElapsedTime -= totalFeeOnDay - fee.max_fee
                        }
                    }
                }
            });
    
            mfoets.forEach(fee => {
                if (fragTotal >= 60 * fee.limit_time) {
                    console.log(`入庫後時間制最大料金確認${totalFeeOnElapsedTime}`);
                    if (totalFeeOnElapsedTime > fee.max_fee) {
                        console.log(`入庫後時間制最大料金適用による差額${totalFeeOnElapsedTime - fee.max_fee}`);
                        totalFee -= totalFeeOnElapsedTime - fee.max_fee;
                        fragTotal = 0;
                        totalFeeOnElapsedTime = 0;
                    }
                }
            });
            console.log(`料金${totalFee}`)

            {/*mfwps.forEach(fee => {
                if fee.
            })*/}
        }
    
        setCalculatedFee(totalFee); // 計算結果を状態に保存
    };
    
    
    return (
        <Authenticated user={auth.user} header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    駐車場の登録
                </h2>
            }>
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

                {/* 開始日時の入力 */}
                <div className="my-6">
                    <label className="block font-bold mb-2">開始日時:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-400 rounded-md p-2"
                    />
                </div>

                {/* 終了日時の入力 */}
                <div className="my-6">
                    <label className="block font-bold mb-2">終了日時:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-gray-400 rounded-md p-2"
                    />
                </div>


                <div className="my-6">
                    <button
                        className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        onClick={calculateFee} // 料金計算ボタン
                    >
                        駐車料金を計算
                    </button>
                </div>

                <div className="my-6">
                    <p>計算された料金: {calculatedFee}円</p>
                </div>

                <div className="my-6">
                    <Link href="/locations">戻る</Link>
                </div>
            </div>
        </Authenticated>
    );
};

export default Show;
