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
        const startDate = start.getDate();
        const end = new Date(endTime);
        const endDate = end.getDate();
        const parkingTime = (end - start) / (1000 * 60 * 60);

        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
        }

        //start endからhh:mm:ssの部分のみ抽出
        const startHour = start.toTimeString().split(" ")[0];
        const endHour = end.toTimeString().split(" ")[0];

        //hh:mm:ssを全て分でint型に0:00:00 0分, 6:00:00 360分
        const startMinutes = timeToMinutes(startHour)
        const endMinutes = timeToMinutes(endHour)
        

        console.log(`駐車時間:${parkingTime}時間`);
    
        if (start >= end) {
            alert("開始日時は終了日時より前でなければなりません");
            return;
        }

        let totalFee = 0;
        if (startDate == endDate) {
            let is_overlapped = true
            //日にちをまたがない
            console.log(`${startHour} ~ ${endHour}`)
            basic_fees.forEach(fee => {
                if (fee.start_time < fee.end_time) {
                    if ((fee.start_time < startHour) && (endHour < fee.end_time)) {
                        //期間をまたがない
                        is_overlapped = false
                        console.log(`${fee.start_time}~${fee.end_time} またいでいない`)
                        if (parkingTime <= mfoets[0].limit_time) {
                            let limitMinutes = mfoets[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfoets[0].max_fee
                            }
                        } else{
                            let limitMinutes = mfods[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfods[0].max_fee
                            }
                        }
                    }
                } else {
                    if (endHour < fee.end_time) {
                        is_overlapped = false
                        console.log(`0:00~${fee.end_time} またいでいない`)
                        if (parkingTime <= mfoets[0].limit_time) {
                            let limitMinutes = mfoets[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfoets[0].max_fee
                            }
                        } else{
                            let limitMinutes = mfods[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfods[0].max_fee
                            }
                        }
                    } else if (fee.start_time < startHour) {
                        is_overlapped = false
                        console.log(`${fee.start_time}~24:00 またいでいない`)
                        if (parkingTime <= mfoets[0].limit_time) {
                            let limitMinutes = mfoets[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfoets[0].max_fee
                            }
                        } else{
                            let limitMinutes = mfods[0].max_fee / fee.fee * fee.duration
                            if (limitMinutes > parkingTime * 60) {
                                totalFee = Math.ceil((parkingTime * 60) / fee.duration) * fee.fee
                            } else {
                                totalFee = mfods[0].max_fee
                            }
                        }
                    }
                }
            });

            let overlappedTwiceMinutes = 0
            if (is_overlapped) {
                //期間をまたぐ
                console.log("期間をまたぐ")
                let beforeMinutes = 0
                let beforeFee = 0
                let afterMinutes = 0
                let afterFee = 0
                let afterMinutes2 = 0
                let afterFee2 = 0
                let totalMinutes = 0

                basic_fees.forEach(fee => {
                    if (fee.end_time > fee.start_time) {
                        /*
                            基本料金が日をまたがない
                        */
                        if (((fee.start_time < startHour) && (startHour < fee.end_time)) && (endHour > fee.end_time)) {
                            /*
                                またぐ前
                            */
                            beforeMinutes = (timeToMinutes(fee.end_time) - startMinutes)
                            console.log("またぐ前1")
                            beforeFee = Math.ceil(beforeMinutes / fee.duration) * fee.fee
                        } else if ((startHour < fee.start_time) && (endHour > fee.start_time)) {
                            /*
                                またいだ後
                            */
                            afterMinutes = (endMinutes - timeToMinutes(fee.start_time))
                            if (overlappedTwiceMinutes != 0) {
                                afterMinutes = (overlappedTwiceMinutes - timeToMinutes(fee.start_time))
                            }
                            console.log("またいだ後1")
                            afterFee = Math.ceil(afterMinutes / fee.duration) * fee.fee
                        }
                    } else {
                        /*
                            基本料金が日をまたぐ
                        */
                        if ((startHour < fee.end_time) && (fee.start_time < endHour)) {
                            /*
                                二度またぐ
                            */
                           console.log("二度またぎ")
                           beforeMinutes = (timeToMinutes(fee.end_time) - startMinutes)
                           beforeFee = Math.ceil(beforeMinutes / fee.duration) * fee.fee
                           afterMinutes2 = (endMinutes - timeToMinutes(fee.start_time))
                           afterFee2 = Math.ceil(afterMinutes2 / fee.duration) * fee.fee
                           overlappedTwiceMinutes = timeToMinutes(fee.start_time)
                        } else if ((startHour < fee.end_time) && (fee.start_time > endHour)) {
                            /*
                                end_timeを一回またぐ
                            */
                            beforeMinutes = (timeToMinutes(fee.end_time) - startMinutes)
                            console.log("またぐ前2")
                            beforeFee = Math.ceil(beforeMinutes / fee.duration) * fee.fee
                        } else if ((startHour > fee.end_time) && (fee.start_time < endHour)) {
                            /*
                                start_timeを一回またぐ
                            */
                            afterMinutes = (endMinutes - timeToMinutes(fee.start_time))
                            console.log("またいだ後2")
                            afterFee = Math.ceil(afterMinutes / fee.duration) * fee.fee
                        }
                    }
                });
                
                totalMinutes = beforeMinutes + afterMinutes + afterMinutes2
                if (totalMinutes < 12 * mfoets[0].limit_time) {
                    totalFee = Math.min(mfods[0].max_fee, mfoets[0].max_fee, beforeFee + afterFee + afterFee2)
                } else {
                    totalFee = Math.min(mfods[0].max_fee, mfoets[0].max_fee * 2, beforeFee + afterFee + afterFee2)
                }
                console.log(`beforeFee:${beforeFee}`)
                console.log(`afterFee:${afterFee}`)
                console.log(`afterFee2:${afterFee2}`)
            }
        } else {
            //日にちをまたぐ
            console.log("日にちをまたぐ")
            
            let middleDaysFee = 0;
            let startDayFee = 0;
            let endDayFee = 0;
            let parkingDate = endDate - startDate
            if (parkingDate >= 2) {
                middleDaysFee = mfods[0].max_fee * (parkingDate - 1)
                console.log(`間${parkingDate - 1}日${middleDaysFee}円`)
            }

            // startHour から 24:00 までの料金計算
            basic_fees.forEach(fee => {
                if (fee.start_time < fee.end_time) {
                    if (startHour >= fee.start_time) {
                        let minutes = (timeToMinutes("24:00") - startMinutes);
                        startDayFee += Math.ceil(minutes / fee.duration) * fee.fee;
                        if (minutes < mfoets[0].limit_time * 60) {
                            startDayFee = Math.min(startDayFee, mfoets[0].max_fee)
                        } else {
                            startDayFee = Math.min(startDayFee, mfods[0].max_fee)
                        }
                    }
                } else {
                    if (startHour >= fee.start_time || fee.end_time > "00:00") {
                        let minutes = (timeToMinutes("24:00") - startMinutes);
                        startDayFee += Math.ceil(minutes / fee.duration) * fee.fee;
                        if (minutes < mfoets[0].limit_time * 60) {
                            startDayFee = Math.min(startDayFee, mfoets[0].max_fee)
                        } else {
                            startDayFee = Math.min(startDayFee, mfods[0].max_fee)
                        }
                    }
                }
            });

            // 0:00 から endHour までの料金計算
            basic_fees.forEach(fee => {
                if (fee.start_time < fee.end_time) {
                    if (endHour <= fee.end_time) {
                        let minutes = endMinutes;
                        endDayFee += Math.ceil(minutes / fee.duration) * fee.fee;
                        if (minutes < mfoets[0].limit_time * 60) {
                            endDayFee = Math.min(endDayFee, mfoets[0].max_fee)
                        } else {
                            endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                        }
                    }
                } else {
                    if (endHour <= fee.end_time || fee.start_time > "00:00") {
                        let minutes = endMinutes;
                        endDayFee += Math.ceil(minutes / fee.duration) * fee.fee;
                        if (minutes < mfoets[0].limit_time * 60) {
                            endDayFee = Math.min(endDayFee, mfoets[0].max_fee)
                        } else {
                            endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                        }
                    }
                }
            });

            // 最大料金適用
            startDayFee = Math.min(startDayFee, mfods[0].max_fee);
            endDayFee = Math.min(endDayFee, mfods[0].max_fee);

            totalFee += startDayFee + middleDaysFee + endDayFee;
            console.log(`startDayFee: ${startDayFee}円, middleDaysFee: ${middleDaysFee}, endDayFee: ${endDayFee}円, totalFee: ${totalFee}円`);
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

                <div>
                    <Link 
                        href={`/locations/${location.id}/edit`} 
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    >
                        編集
                    </Link>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => {
                            if (confirm("本当に削除しますか？")) {
                                router.delete(`/locations/${location.id}`);
                            }
                        }}
                    >
                        削除
                    </button>
                </div>
            

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
