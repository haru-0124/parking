import React, { useState } from "react"; // useStateをインポート
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, router } from "@inertiajs/react";

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

    const calculateFee = () => {
        if (!startTime || !endTime) {
            alert("開始日、開始時間、終了日、終了時間を入力してください");
            return;
        }

        const start = new Date(startTime);
        const startDate = start.getDate();
        const end = new Date(endTime);
        const endDate = end.getDate();
        const parkingMinutes = (end - start) / (1000 * 60);
        const state = { is_overlapped: true};

        function timeToMinutes(timeStr) {
            //時間:分を分に直す
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
        }
    
        function nonOverlapFee(startHour, endHour, fee, feeStart, feeEnd, parkingMinutes, mfoets, mfods, state) {
            let nonOverlapFee = 0
            if ((feeStart <= startHour) && (endHour <= feeEnd)) {
                nonOverlapFee = Math.ceil(parkingMinutes / fee.duration) * fee.fee
                state.is_overlapped = false
                if (parkingMinutes <= mfoets[0].limit_time * 60) {
                    nonOverlapFee = Math.min(nonOverlapFee, mfoets[0].max_fee, fee.max_fee)
                } else{
                    nonOverlapFee = Math.min(nonOverlapFee, mfods[0].max_fee, fee.max_fee)
                }
                console.log(`${startHour}~${endHour}: ${nonOverlapFee}`)
            }
            return nonOverlapFee
        }

        function periodOverlapFeeBefore(startHour, endHour, fee, feeStart, feeEnd, startMinutes) {
            let periodOverlapMinutesBefore = 0
            let periodOverlapFeeBefore = 0
            if ((feeStart <= startHour) && (startHour < feeEnd) && (feeEnd < endHour)) {
                /*
                    またぐ前
                */
                periodOverlapMinutesBefore = (timeToMinutes(feeEnd) - startMinutes)
                periodOverlapFeeBefore = Math.ceil(periodOverlapMinutesBefore / fee.duration) * fee.fee
                console.log(`${startHour}~${feeEnd}:${periodOverlapFeeBefore}`)
            }
            return periodOverlapFeeBefore
        }

        function periodOverlapFeeAfter(startHour, endHour, fee, feeStart, feeEnd, endMinutes) {
            let periodOverlapMinutesAfter = 0
            let periodOverlapFeeAfter = 0
            if ((startHour < feeStart) && (feeStart < endHour)) {
                /*
                    またいだ後
                */
                if (endHour <= feeEnd) {
                    periodOverlapMinutesAfter = (endMinutes - timeToMinutes(feeStart))
                    periodOverlapFeeAfter = Math.ceil(periodOverlapMinutesAfter / fee.duration) * fee.fee
                    console.log(`${feeStart}~${endHour}:${periodOverlapFeeAfter}`)
                } else {
                    periodOverlapMinutesAfter = (timeToMinutes(feeEnd) - timeToMinutes(feeStart))
                    periodOverlapFeeAfter = Math.ceil(periodOverlapMinutesAfter / fee.duration) * fee.fee
                    console.log(`${feeStart}~${feeEnd}:${periodOverlapFeeAfter}`)
                }
                console.log(periodOverlapFeeAfter)
            }
            return periodOverlapFeeAfter
        }

        function nonDayOverlapFee(startHour, endHour, parkingMinutes, basic_fees, mfoets, mfods, startMinutes, endMinutes, state) {
            let nonDayOverlapFee = 0
            basic_fees.forEach(fee => {
                //期間をまたがない
                if (fee.start_time < fee.end_time) {
                    nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, fee.start_time, fee.end_time, parkingMinutes, mfoets, mfods, state)
                } else {
                    nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, "00:00:00", fee.end_time, parkingMinutes, mfoets, mfods, state)
                    nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, fee.start_time, "24:00:00", parkingMinutes, mfoets, mfods, state)
                }
            });

            if (state.is_overlapped) {
                //期間をまたぐ
                console.log("期間をまたぐ")
                basic_fees.forEach(fee => {
                    if (fee.end_time > fee.start_time) {
                        /*
                            基本料金が日をまたがない
                        */
                        nonDayOverlapFee += periodOverlapFeeBefore(startHour, endHour, fee, fee.start_time, fee.end_time, startMinutes)
                        console.log(`日をまたがないbefore計算後${nonDayOverlapFee}`)
                        nonDayOverlapFee += periodOverlapFeeAfter(startHour, endHour, fee, fee.start_time, fee.end_time, endMinutes)
                        console.log(`日をまたがないafter計算後${nonDayOverlapFee}`)
                    } else {
                        /*
                            基本料金が日をまたぐ
                        */
                        nonDayOverlapFee += periodOverlapFeeBefore(startHour, endHour, fee, "00:00:00", fee.end_time, startMinutes)
                        console.log(`日をまたぐbefore計算後${nonDayOverlapFee}`)
                        nonDayOverlapFee += periodOverlapFeeAfter(startHour, endHour, fee, fee.start_time, "24:00:00", endMinutes)
                        console.log(`日をまたぐafter計算後${nonDayOverlapFee}`)
                    }
                });
                
                if (parkingMinutes < 60 * mfoets[0].limit_time) {
                    nonDayOverlapFee = Math.min(mfoets[0].max_fee, nonDayOverlapFee)
                } else {
                    nonDayOverlapFee = Math.min(mfods[0].max_fee, nonDayOverlapFee)
                }
            }
            state.is_overlapped = true
            return nonDayOverlapFee
        }

        function calculateByBasicFee(parkingDate, startHour, startMinutes, endHour, endMinutes, basic_fees){
            console.log(`基本料金で計算`)
            let overDayFee = 0; //18:00~6:00の区間にかかる料金
            let nonOverDayFee = 0; //6:00~18:00の区間にかかる料金
            let nonOverDayBasicFee = 0
            let overDayBasicFee = 0
            let startDayFee = 0
            let endDayFee = 0
            
            basic_fees.forEach(fee => {
                console.log(fee)
                if(fee.start_time < fee.end_time){
                    nonOverDayBasicFee = fee
                } else {
                    overDayBasicFee = fee
                }
            })
            console.log(`overDayBasicFee ${overDayBasicFee}`)
            console.log(`nonOverDayBasicFee ${nonOverDayBasicFee}`)
            //2日間停めた時
            if(parkingDate == 1){
                //駐車時間が18:00~6:00に収まっている場合
                if(startHour > overDayBasicFee.start_time && endHour < overDayBasicFee.end_time){
                    //停めた時間分料金を加算する
                    overDayFee = Math.ceil(parkingMinutes / overDayBasicFee.duration) * overDayBasicFee.fee
                //入庫時間と出庫時間のどちらも18:00~6:00の時間外の時
                } else if (startHour < overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                    //18:00~6:00にかかった料金をoverDayFeeに入れる
                    overDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                            +(timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                            / overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                    //入庫～18:00までの料金をstartDayFeeに入れる
                    startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfoets,mfods,startMinutes,timeToMinutes(overDayBasicFee.end_time),state)
                    //6:00~出庫までの料金をendDayFeeに入れる
                    endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfoets,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
                //入庫時間は18:00~24:00に収まっていて、出庫時間が6:00以降の場合
                } else if (startHour > overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                    //入庫~6:00までの料金をoverDayFeeに入れる
                    overDayFee = Math.ceil(((timeToMinutes("24:00:00")-startMinutes)
                                            +(timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                            / overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                    //6:00~出庫までの料金をendDayFeeに入れる
                    endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfoets,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
                //入庫時間が18:00より前で、出庫時間が0:00~6:00に収まっている場合
                } else if (startHour < overDayBasicFee.start_time && endHour < overDayBasicFee.end_time) {
                    //18:00~出庫までの料金をoverDayFeeに入れる
                    overDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                            +(endMinutes - timeToMinutes("0:00:00")))
                                            / overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                    //入庫~18:00までの料金をstartDayFeeに入れる
                    startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfoets,mfods,startMinutes,timeToMinutes(overDayBasicFee.end_time),state)
                }
                console.log(`overDayFee ${overDayFee}`)
                console.log(`startDayFee ${startDayFee}`)
                console.log(`endDayFee ${endDayFee}`)
                totalFee = overDayFee + startDayFee + endDayFee
            //3日以上停めた場合
            } else if (parkingDate >= 2){
                //初日の入庫時間と最終日の出庫時間がそれぞれ18:00~24:00、0:00~6:00に収まっていない場合
                if(startHour < overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                    //18:00~6:00に停めた分の合計料金をoverDayFeeに入れる
                    overDayFee = Math.ceil((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time))/overDayBasicFee.duration)*overDayBasicFee.fee * parkingDate
                    //6:00~18:00に停めた分の合計料金をnonOverDayFeeに入れる
                    nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)*nonOverDayBasicFee.fee * (parkingDate - 1)
                    //入庫~18:00までの料金をstartDayFeeに入れる
                    startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfoets,mfods,startMinutes,timeToMinutes(overDayBasicFee.end_time),state)
                    //6:00~出庫までの料金をendDayFeeに入れる
                    endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfoets,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
                //初日の入庫時間と最終日の共に18:00~0:00の枠に収まっている場合
                } else if (startHour > overDayBasicFee.start_time && endHour < overDayBasicFee.end_time){
                    //入庫~6:00までの料金をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes("24:00:00")-startMinutes)
                                                +(timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                                / overDayBasicFee.duration)
                                                * overDayBasicFee*fee
                    //18:00~出庫までの料金をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                                +(endMinutes-timeToMinutes("0:00:00")))
                                                / overDayBasicFee.duration)
                                                * overDayBasicFee.fee
                    //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration)*overDayBasicFee.fee * (parkingDate - 2)
                    //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                    nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)/nonOverDayBasicFee.fee * (parkingDate -1)
                //初日の入庫時間は18:00~24:00に収まっているが、最終日の出庫時間が6時以降の場合
                } else if (startHour > overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                    //入庫~6:00までまでにかかる料金をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes("24:00:00")-startMinutes)
                                                + (timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                                / overDayBasicFee.duration)
                                                * overDayBasicFee.fee
                    //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration)*overDayBasicFee.fee * (parkingDate - 1)
                    //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                    nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)/nonOverDayBasicFee.fee * (parkingDate - 1)
                    //6:00~出庫にかかる料金をendDayFeeに入れる
                    endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfoets,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
                //初日の入庫時間が18:00より前で、最終日の出庫時間は0:00~6:00に収まっている場合
                } else if (startHour < overDayBasicFee.start_time && endHour < overDayBasicFee.end_time){
                    //18:00~出庫までにかかる料金をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time)))
                                                + (endMinutes-timeToMinutes("0:00:00"))
                                                /overDayBasicFee.duration)
                                                * overDayBasicFee.fee
                    //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                    overDayFee += Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration)*overDayBasicFee.fee * (parkingDate - 1)
                    //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                    nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)/nonOverDayBasicFee.fee * (parkingDate - 1)
                    //入庫~18:00にかかる料金をstartDayFeeに入れる
                    startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfoets,mfods,startMinutes,timeToMinutes(overDayBasicFee.end_time),state)
                }
                totalFee = overDayFee + nonOverDayFee + startDayFee + endDayFee
            }
            console.log(`基本料金の計算を終了`)
            return totalFee;
        }

        //start endからhh:mm:ssの部分のみ抽出
        const startHour = start.toTimeString().split(" ")[0];
        const endHour = end.toTimeString().split(" ")[0];

        //hh:mm:ssを全て分でint型に0:00:00 0分, 6:00:00 360分
        const startMinutes = timeToMinutes(startHour)
        const endMinutes = timeToMinutes(endHour)
        
        console.log(startTime, endTime)
        console.log(`駐車時間:${parkingMinutes}分`);
    
        if (start >= end) {
            alert("開始日時は終了日時より前でなければなりません");
            return;
        }

        let totalFee = 0;
        if (startDate == endDate) {
            //日にちをまたがない
            console.log(`${startHour} ~ ${endHour}`)
            totalFee = nonDayOverlapFee(startHour, endHour, parkingMinutes, basic_fees, mfoets, mfods, startMinutes, endMinutes, state)
            setCalculatedFee(totalFee)
        } else {
            //日にちをまたぐ
            console.log("日にちをまたぐ")
            let parkingDate = endDate - startDate

            let startDayFee = 0;//入庫～18:00にかかる料金
            let endDayFee = 0; //6:00~出庫にかかる料金
            let middleDaysFee = 0;
            let totalFee = calculateByBasicFee(parkingDate, startHour, startMinutes, endHour, endMinutes, basic_fees)
            if (parkingMinutes <= mfoets[0].limit_time * 60) {
                console.log(totalFee, mfoets[0].max_fee)
                totalFee = Math.min(totalFee, mfoets[0].max_fee)
            } else if (mfods[0] != 0){
                if(parkingDate == 1){
                    // startHour から 24:00 までの料金計算
                    startDayFee = nonDayOverlapFee(startHour, "24:00:00", timeToMinutes("24:00:00") - startMinutes ,basic_fees, mfoets, mfods, startMinutes, timeToMinutes("24:00:00"), state)
                    startDayFee = Math.min(startDayFee,mfoets[0].max_fee)
                    // 0:00 から endHour までの料金計算
                    endDayFee = nonDayOverlapFee("00:00:00", endHour, endMinutes, basic_fees, mfoets, mfods, timeToMinutes("00:00:00"), endMinutes, state)
                    endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                    totalFee = startDayFee + endDayFee
                } else if (parkingDate >= 2){
                    // startHour から 24:00 までの料金計算
                    startDayFee = nonDayOverlapFee(startHour, "24:00:00", timeToMinutes("24:00:00") - startMinutes ,basic_fees, mfoets, mfods, startMinutes, timeToMinutes("24:00:00"), state)
                    startDayFee = Math.min(startDayFee,mfoets[0].max_fee)
                    // 0:00 から endHour までの料金計算
                    endDayFee = nonDayOverlapFee("00:00:00", endHour, endMinutes, basic_fees, mfoets, mfods, timeToMinutes("00:00:00"), endMinutes, state)
                    endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                    //中間の日の料金
                    middleDaysFee = mfods[0].max_fee * (parkingDate - 1)
                    totalFee = startDayFee + middleDaysFee + endDayFee
                }
            }
        console.log(`startDayFee: ${startDayFee}円, middleDaysFee: ${middleDaysFee}, endDayFee: ${endDayFee}円, totalFee: ${totalFee}円`);
        setCalculatedFee(totalFee)
        }
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
                        <div key={fee.id} style={{ marginBottom: fee.max_fee ? '16px' : '8px' }}>
                            <h2>{fee.start_time}~{fee.end_time}</h2>
                            <p>{fee.duration}分{fee.fee}円</p>
                            {fee.max_fee && <p>最大{fee.max_fee}円</p>}
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