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
        console.log(parkingTime);
    
        if (start >= end) {
            alert("開始日時は終了日時より前でなければなりません");
            return;
        }
    
        let totalFee = 0;
        console.log("適用する基本料金:", basic_fees);
    
        let current = new Date(start);
        while (current < end) {
            let nextDay = new Date(current);
            let totalFeeDay = 0;
            nextDay.setHours(23, 59, 59, 999); // その日の終了
            let dayEnd = nextDay < end ? nextDay : end; // ループの終了時間
    
            basic_fees.forEach(fee => {
                let periodStart = new Date(current);
                let periodEnd = new Date(current);
                let increment = 0
    
                [periodStart.setHours(...fee.start_time.split(':')), periodStart.setMinutes(0, 0, 0)];
                [periodEnd.setHours(...fee.end_time.split(':')), periodEnd.setMinutes(0, 0, 0)];
    
                if (fee.start_time > fee.end_time) {  // 18:00~6:00 の場合
                    let periodEndPart1 = new Date(current);
                    periodEndPart1.setHours(23, 59, 59, 999);
                    let periodStartPart2 = new Date(current);
                    periodStartPart2.setHours(0, 0, 0, 0);
                    let periodEndPart2 = new Date(periodStartPart2);
                    periodEndPart2.setHours(...fee.end_time.split(':'));
                    periodEndPart2.setMinutes(0, 0, 0);
                    let overlapMinutes = 0;
    
                    // 18:00~24:00 の計算
                    if (current < periodEndPart1 && dayEnd > periodStart) {
                        let overlapStart = current > periodStart ? current : periodStart;
                        let overlapEnd = dayEnd < periodEndPart1 ? dayEnd : periodEndPart1;
                        overlapMinutes += (overlapEnd - overlapStart) / (1000 * 60);
                    }
    
                    // 0:00~6:00 の計算
                    if (current < periodEndPart2 && dayEnd > periodStartPart2) {
                        let overlapStart = current > periodStartPart2 ? current : periodStartPart2;
                        let overlapEnd = dayEnd < periodEndPart2 ? dayEnd : periodEndPart2;
                        overlapMinutes += (overlapEnd - overlapStart) / (1000 * 60);
                    }

                    increment = Math.ceil(overlapMinutes / fee.duration) * fee.fee;
                    totalFeeDay += increment
                    console.log(`基本料金 (18:00~06:00) - ${increment}円`);
                } else {
                    if (current < periodEnd && dayEnd > periodStart) {
                        let overlapStart = current > periodStart ? current : periodStart;
                        let overlapEnd = dayEnd < periodEnd ? dayEnd : periodEnd;
                        let overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
                        increment = Math.ceil(overlapMinutes / fee.duration) * fee.fee;
                        
                        totalFeeDay += increment
                        console.log(`基本料金 (6:00~18:00) - ${increment}円`);
                    }
                }
            });
    
            mfods.forEach(fee => {
                if (totalFeeDay > fee.max_fee) {
                    totalFee += fee.max_fee
                    console.log(`当日最大料金: ${fee.max_fee}`);
                } else{
                    totalFee += totalFeeDay
                }
            });
    
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0);
        }
    
        setCalculatedFee(totalFee);
        console.log(`最終料金: ${totalFee} 円`);
    };
    
    const handleBackClick = (e) => {
        e.preventDefault();

        // 現在の駐車場の位置を保存
        localStorage.setItem("lastLocation", JSON.stringify({
          lat: location.latitude,
          lng: location.longitude
        }));
        alert("保存されたよ！");
        console.log("現在のlocationオブジェクト:", location);
        console.log("保存した座標:", location.latitude, location.longitude);
        setTimeout(() => {
            router.visit("/locations");
        }, 500);
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

                <button onClick={handleBackClick}>
                    戻る
                </button>
            </div>
        </Authenticated>
    );
};

export default Show;
