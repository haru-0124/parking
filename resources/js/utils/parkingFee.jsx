export function calculateParkingFee(startTime, endTime, basic_fees, mfods, mfoets, state = { is_overlapped: true, is_regressed: false }) {
    // 複雑なロジックはここに
    function timeToMinutes(timeStr) {
        //時間:分を分に直す
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }

    function parkingSimpleFee(parkingMinutes, fee) {
        let parkingSimpleFee = Math.ceil(parkingMinutes / fee.duration) * fee.fee
        if (fee?.max_fee != null) {
            parkingSimpleFee = Math.min(fee.max_fee, parkingSimpleFee)
        }
        return parkingSimpleFee
    }

    function nonOverlapFee(startMinutes, endMinutes, fee, feeStart, feeEnd, parkingMinutes, state) {
        //文字列から分に
        let feeStartMinutes = timeToMinutes(feeStart)
        let feeEndMinutes = timeToMinutes(feeEnd)
        console.log('nonoverlap起動')
        //feeEnsMinutesが23:59:00のときは24:00:00とする
        if (feeEnd === "23:59:00") {
            feeEndMinutes = 1440;
        }
        //期間をまたがない場合の計算
        let nonOverlapFee = 0
        //駐車時間がfeeStartとfeeEndの間に収まる
        if ((feeStartMinutes <= startMinutes) && (endMinutes <= feeEndMinutes)) {
            //基本料金の計算
            nonOverlapFee = parkingSimpleFee(parkingMinutes, fee)
            state.is_overlapped = false
            console.log(`nonOverlapFee ${startMinutes}~${endMinutes}: ${nonOverlapFee}`)
        }
        return nonOverlapFee
    }

    function periodOverlapFeeBefore(startMinutes, endMinutes, fee, feeStart, feeEnd) {
        let feeStartMinutes = timeToMinutes(feeStart)
        let feeEndMinutes = timeToMinutes(feeEnd)
        //feeEnsMinutesが23:59:00のときは24:00:00とする
        if (feeEnd === "23:59:00") {
            feeEndMinutes = 1440;
        }
        //期間をまたぐときのまたぐ前の部分の計算
        let periodOverlapMinutesBefore = 0
        let periodOverlapFeeBefore = 0
        //駐車開始時間はfeeStartとfeeEndの間に収まるが、駐車終了時間はfeeEndのあとになる」
        if ((feeStartMinutes <= startMinutes) && (startMinutes < feeEndMinutes) && (feeEndMinutes < endMinutes)) {
            /*
                またぐ前
            */
            periodOverlapMinutesBefore = (feeEndMinutes - startMinutes)
            periodOverlapFeeBefore = parkingSimpleFee(periodOverlapMinutesBefore, fee)
            console.log(`前 ${startMinutes}~${feeEndMinutes}:${periodOverlapFeeBefore}`)
        }
        return periodOverlapFeeBefore
    }

    function periodOverlapFeeAfter(startMinutes, endMinutes, fee, feeStart, feeEnd) {
        let feeStartMinutes = timeToMinutes(feeStart)
        let feeEndMinutes = timeToMinutes(feeEnd)
        //feeEnsMinutesが23:59:00のときは24:00:00とする
        if (feeEnd === "23:59:00") {
            feeEndMinutes = 1440;
        }
        //期間をまたぐときのまたいだ後の計算
        let periodOverlapMinutesAfter = 0
        let periodOverlapFeeAfter = 0
        //駐車開始時間はfeeStartより前で駐車終了時間はfeeStartより後
        if ((startMinutes < feeStartMinutes) && (feeStartMinutes < endMinutes)) {
            /*
                またいだ後
            */
            if (endMinutes <= feeEndMinutes) {
                //これ以上期間を超えない場合
                periodOverlapMinutesAfter = (endMinutes - feeStartMinutes)
                periodOverlapFeeAfter = parkingSimpleFee(periodOverlapMinutesAfter, fee)
                console.log(`後 ${feeStartMinutes}~${endMinutes}:${periodOverlapFeeAfter}`)
            } else {
                //さらに期間を超えて駐車する場合
                periodOverlapMinutesAfter = (timeToMinutes(feeEnd) - timeToMinutes(feeStart))
                periodOverlapFeeAfter = parkingSimpleFee(periodOverlapMinutesAfter, fee)
                console.log(`中 ${feeStartMinutes}~${feeEndMinutes}:${periodOverlapFeeAfter}`)
            }
        }
        return periodOverlapFeeAfter
    }

    function nonDayOverlapFee(startMinutes, endMinutes, parkingMinutes, basic_fees, mfods, state) {
        //日をまたがないときの計算をまとめたもの
        console.log("nonDayOverlapFee起動")
        let totalFee = 0
        basic_fees.forEach(fee => {
            //期間をまたがない
            if (fee.start_time < fee.end_time) {
                totalFee += nonOverlapFee(startMinutes, endMinutes, fee, fee.start_time, fee.end_time, parkingMinutes, state)
            } else {
                totalFee += nonOverlapFee(startMinutes, endMinutes, fee, "00:00:00", fee.end_time, parkingMinutes, state)
                totalFee += nonOverlapFee(startMinutes, endMinutes, fee, fee.start_time, "24:00:00", parkingMinutes, state)
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
                    totalFee += periodOverlapFeeBefore(startMinutes, endMinutes, fee, fee.start_time, fee.end_time)
                    totalFee += periodOverlapFeeAfter(startMinutes, endMinutes, fee, fee.start_time, fee.end_time)
                } else {
                    /*
                        基本料金が日をまたぐ
                    */
                    totalFee += periodOverlapFeeBefore(startMinutes, endMinutes, fee, "00:00:00", fee.end_time)
                    totalFee += periodOverlapFeeAfter(startMinutes, endMinutes, fee, fee.start_time, "24:00:00")
                }
            });
        }
        if (mfods[0]?.max_fee != null) {
            totalFee = Math.min(mfods[0].max_fee, totalFee)
        }
        state.is_overlapped = true
        console.log(`1日の合計${totalFee}`)
        return totalFee
    }

    function calculateByBasicFee(parkingDate, startMinutes, endMinutes, basic_fees, state){
        console.log(`基本料金で計算`)
        let overDayMinutes = 0;
        let overDayFee = 0; //18:00~6:00の区間にかかる料金
        let nonOverDayMinutes = 0;
        let nonOverDayFee = 0; //6:00~18:00の区間にかかる料金
        let overDayBasicFee = 0
        let nonOverDayBasicFee = 0
        let startDayFee = 0
        let endDayFee = 0
        let overDayBasicFeeStartMinutes = 0
        let overDayBasicFeeEndMinutes = 0
        let nonOverDayBasicFeeStartMinutes = 0
        let nonOverDayBasicFeeEndMinutes = 0        
        basic_fees.forEach(fee => {
            if(fee.start_time < fee.end_time){
                nonOverDayBasicFee = fee
                nonOverDayBasicFeeStartMinutes  = timeToMinutes(fee.start_time)
                nonOverDayBasicFeeEndMinutes = timeToMinutes(fee.end_time)
            } else {
                overDayBasicFee = fee
                overDayBasicFeeStartMinutes = timeToMinutes(fee.start_time)
                overDayBasicFeeEndMinutes = timeToMinutes(fee.end_time)
            }
        })

        //2日間停めた時
        if(parkingDate == 2){
            console.log("2日間停めた")
            //駐車時間が18:00~6:00に収まっている場合
            if(startMinutes >= overDayBasicFeeStartMinutes && endMinutes <= overDayBasicFeeEndMinutes){
                //停めた時間分料金を加算する
                overDayFee = parkingSimpleFee(parkingMinutes, overDayBasicFee)
            //入庫時間と出庫時間のどちらも18:00~6:00の時間外の時
            } else if (startMinutes < overDayBasicFeeStartMinutes && endMinutes > overDayBasicFeeEndMinutes){
                //18:00~6:00にかかった料金をoverDayFeeに入れる
                overDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                overDayFee = parkingSimpleFee(overDayMinutes, overDayBasicFee)
                //入庫～18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startMinutes, overDayBasicFeeStartMinutes, overDayBasicFeeStartMinutes-startMinutes,basic_fees,mfods,state)
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFeeEndMinutes,endMinutes,endMinutes-overDayBasicFeeEndMinutes,basic_fees,mfods,state)
            //入庫時間は18:00~24:00に収まっていて、出庫時間が6:00以降の場合
            } else if (startMinutes >= overDayBasicFeeStartMinutes && endMinutes > overDayBasicFeeEndMinutes){
                //入庫~6:00までの料金をoverDayFeeに入れる
                overDayMinutes = (timeToMinutes("24:00:00")-startMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                overDayFee = parkingSimpleFee(overDayMinutes, overDayBasicFee)
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFeeEndMinutes,endMinutes,endMinutes-overDayBasicFeeEndMinutes,basic_fees,mfods,state)
            //入庫時間が18:00より前で、出庫時間が0:00~6:00に収まっている場合
            } else if (startMinutes < overDayBasicFeeStartMinutes && endMinutes <= overDayBasicFeeEndMinutes) {
                //18:00~出庫までの料金をoverDayFeeに入れる
                overDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (endMinutes - timeToMinutes("0:00:00"))
                overDayFee = parkingSimpleFee(overDayMinutes, overDayBasicFee)
                //入庫~18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startMinutes, overDayBasicFeeStartMinutes,overDayBasicFeeStartMinutes-startMinutes,basic_fees,mfods,state)
            } else {
                console.log("2日目基本料金エラー")
            }
            console.log(`overDayFee ${overDayFee}`)
            console.log(`startDayFee ${startDayFee}`)
            console.log(`endDayFee ${endDayFee}`)
            totalFee = overDayFee + startDayFee + endDayFee
        //3日以上停めた場合
        } else if (parkingDate >= 3){
            let unitOverDayFee = 0
            let unitOverDayMinutes = 0
            //初日の入庫時間と最終日の出庫時間がそれぞれ18:00~24:00、0:00~6:00に収まっていない場合
            if (startMinutes < overDayBasicFeeStartMinutes && endMinutes > overDayBasicFeeEndMinutes){
                //18:00~6:00に停めた分の合計料金をoverDayFeeに入れる
                overDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                overDayFee = parkingSimpleFee(overDayMinutes, overDayBasicFee)
                overDayFee *= parkingDate - 1
                console.log(`overDayFee${overDayFee}`)
                //6:00~18:00に停めた分の合計料金をnonOverDayFeeに入れる
                nonOverDayMinutes = nonOverDayBasicFeeEndMinutes-nonOverDayBasicFeeStartMinutes
                nonOverDayFee = parkingSimpleFee(nonOverDayMinutes, nonOverDayBasicFee)
                nonOverDayFee *= parkingDate - 2
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //入庫~18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startMinutes, overDayBasicFeeStartMinutes,overDayBasicFeeStartMinutes-startMinutes,basic_fees,mfods,state)
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFeeEndMinutes,endMinutes,endMinutes-overDayBasicFeeEndMinutes,basic_fees,mfods,state)
            //初日の入庫時間と最終日の共に18:00~6:00の枠に収まっている場合
            } else if (startMinutes >= overDayBasicFeeStartMinutes && endMinutes <= overDayBasicFeeEndMinutes){
                //入庫~6:00までの料金をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-startMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //18:00~出庫までの料金をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (endMinutes-timeToMinutes("0:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                unitOverDayFee *= parkingDate - 3
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayMinutes = nonOverDayBasicFeeEndMinutes-nonOverDayBasicFeeStartMinutes
                nonOverDayFee = parkingSimpleFee(nonOverDayMinutes, nonOverDayBasicFee)
                nonOverDayFee *= (parkingDate -2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
            //初日の入庫時間は18:00~24:00に収まっているが、最終日の出庫時間が6時以降の場合
            } else if (startMinutes >= overDayBasicFeeStartMinutes && endMinutes > overDayBasicFeeEndMinutes){
                //入庫~6:00までまでにかかる料金をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-startMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                unitOverDayFee *= parkingDate - 2
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayMinutes = nonOverDayBasicFeeEndMinutes-nonOverDayBasicFeeStartMinutes
                nonOverDayFee = parkingSimpleFee(nonOverDayMinutes, nonOverDayBasicFee)
                nonOverDayFee *= (parkingDate - 2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //6:00~出庫にかかる料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFeeEndMinutes,endMinutes,endMinutes-overDayBasicFeeEndMinutes,basic_fees,mfods,state)
            //初日の入庫時間が18:00より前で、最終日の出庫時間は0:00~6:00に収まっている場合
            } else if (startMinutes < overDayBasicFeeStartMinutes && endMinutes <= overDayBasicFeeEndMinutes){
                //18:00~出庫までにかかる料金をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (endMinutes-timeToMinutes("0:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayMinutes = (timeToMinutes("24:00:00")-overDayBasicFeeStartMinutes) + (overDayBasicFeeEndMinutes-timeToMinutes("00:00:00"))
                unitOverDayFee = parkingSimpleFee(unitOverDayMinutes, overDayBasicFee)
                unitOverDayFee *= parkingDate - 2
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayMinutes = nonOverDayBasicFeeEndMinutes-nonOverDayBasicFeeStartMinutes
                nonOverDayFee = parkingSimpleFee(nonOverDayMinutes, nonOverDayBasicFee)
                nonOverDayFee *= (parkingDate - 2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //入庫~18:00にかかる料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startMinutes, overDayBasicFeeStartMinutes,overDayBasicFeeStartMinutes-startMinutes,basic_fees,mfods,state)
            } else {
                console.log("3日目基本料金エラー")
            }
            totalFee = overDayFee + nonOverDayFee + startDayFee + endDayFee
        }
        console.log(`基本料金の計算を終了`)
        return totalFee;
    }

    if (!startTime || !endTime) {
        alert("開始日、開始時間、終了日、終了時間を入力してください");
        return;
    }

    const start = new Date(startTime);
    const startDate = start.getDate();
    const end = new Date(endTime);
    const endDate = end.getDate();
    const parkingMinutes = (end - start) / (1000 * 60);

    //start endからhh:mm:ssの部分のみ抽出
    const startHour = start.toTimeString().split(" ")[0];
    const endHour = end.toTimeString().split(" ")[0];

    //hh:mm:ssを全て分でint型に0:00:00 0分, 6:00:00 360分
    const startMinutes = timeToMinutes(startHour)
    const endMinutes = timeToMinutes(endHour)
    
    if (state.is_regressed) {
        console.log("回帰中")
    }
    console.log(startTime, endTime)
    console.log(`駐車時間:${parkingMinutes}分`);

    if (start >= end) {
        alert("開始日時は終了日時より前でなければなりません");
        return;
    }

    let totalFee = Infinity;
    if (startDate == endDate) {
        //日にちをまたがない
        console.log(`${startHour} ~ ${endHour}`)
        totalFee = nonDayOverlapFee(startMinutes, endMinutes, parkingMinutes, basic_fees, mfods, state)
    } else {
        //日にちをまたぐ
        console.log("日にちをまたぐ")
        let parkingDate = endDate - startDate + 1
        let startDayFee = 0;//入庫～18:00にかかる料金
        let endDayFee = 0; //6:00~出庫にかかる料金
        let middleDaysFee = 0;
        let dayOverlap = false
        basic_fees.forEach(fee =>  {
            if (fee.start_time > fee.end_time) {
                dayOverlap = true
                console.log('startとendの逆転')
            } else {
                console.log('startとendの逆転なし')
            }
        })
        if (dayOverlap) {
            totalFee = calculateByBasicFee(parkingDate, startMinutes, endMinutes, basic_fees, state)
        }
        if(parkingDate == 2){
            // startHour から 24:00 までの料金計算
            startDayFee = nonDayOverlapFee(startMinutes, timeToMinutes("24:00:00"), timeToMinutes("24:00:00") - startMinutes, basic_fees, mfods, state)
            // 0:00 から endHour までの料金計算
            endDayFee = nonDayOverlapFee(timeToMinutes("00:00:00"), endMinutes, endMinutes-timeToMinutes("00:00:00"),basic_fees, mfods, state)
            totalFee = Math.min(totalFee, startDayFee + endDayFee)
        } else if (parkingDate >= 3){
            // startHour から 24:00 までの料金計算
            startDayFee = nonDayOverlapFee(startMinutes, timeToMinutes("24:00:00"), timeToMinutes("24:00:00") - startMinutes ,basic_fees, mfods, state)
            // 0:00 から endHour までの料金計算
            endDayFee = nonDayOverlapFee(timeToMinutes("00:00:00"), endMinutes, endMinutes-timeToMinutes("00:00:00"), basic_fees, mfods, state)
            //中間の日の料金
            middleDaysFee = nonDayOverlapFee(timeToMinutes("00:00:00"), timeToMinutes("24:00:00"), timeToMinutes("24:00:00")-timeToMinutes("00:00:00"), basic_fees, mfods, state) * (parkingDate - 2)
            totalFee = Math.min(totalFee, startDayFee + middleDaysFee + endDayFee)
        }
    console.log(`startDayFee: ${startDayFee}円, middleDaysFee: ${middleDaysFee}, endDayFee: ${endDayFee}円, totalFee: ${startDayFee + middleDaysFee + endDayFee}円`);
    }

    //入庫後時間制最大料金の計算
    if (mfoets[0]?.max_fee != null && !state.is_regressed) {
        state.is_regressed = true
        let mfoetsTimeNum = Math.floor(parkingMinutes / (mfoets[0].limit_time * 60))
        const newStartTime = new Date(startTime)
        const newEndTime = new Date(endTime)
        newStartTime.setHours(newStartTime.getHours() + mfoets[0].limit_time * mfoetsTimeNum)
        if (newStartTime.getTime() != newEndTime.getTime()) {
            //回帰により残りの時間の料金を求める
            if (mfoetsTimeNum >= 1){
                let mfoetsAndBf = mfoets[0].max_fee * mfoetsTimeNum + calculateParkingFee(newStartTime, newEndTime, basic_fees, mfods, mfoets, state)
                console.log(`mfoetsとbf${mfoetsAndBf}`)
                totalFee = Math.min(mfoets[0].max_fee * (mfoetsTimeNum + 1), mfoetsAndBf, totalFee)
            }
            console.log(`mfoetsのみ${mfoets[0].max_fee * (mfoetsTimeNum + 1)}`)
            totalFee = Math.min(mfoets[0].max_fee * (mfoetsTimeNum + 1), totalFee)
        } else {
            totalFee = Math.min(mfoets[0].max_fee * mfoetsTimeNum, totalFee)
            console.log(`mfoetsのみ${mfoets[0].max_fee * mfoetsTimeNum}`)
        }
    }
    console.log(`totalFee ${totalFee}`)
    return totalFee;
};

export function generateFeeGraphDataWithNextIncrease(startTime, now, basic_fees, mfods, mfoets, state = { is_overlapped: true, is_regressed: false }) {
    const labels = [];
    const data = [];

    let currentFee = calculateParkingFee(startTime, now, basic_fees, mfods, mfoets, state);
    let nextIncreaseMinutes = null;

    for (let i = 0; i <= 24 * 60; i += 10) {
        const futureTime = new Date(now.getTime() + i * 60 * 1000);
        const fee = calculateParkingFee(startTime, futureTime, basic_fees, mfods, mfoets, state);

        // グラフデータ
        const hours = Math.floor(i / 60);
        const minutes = i % 60;
        labels.push(`${hours}h${minutes > 0 ? `${minutes}m` : ''}`);
        data.push(fee);

        // 次の料金増加を検出（最初に増えた時のみ記録）
        if (nextIncreaseMinutes === null && fee > currentFee) {
            nextIncreaseMinutes = i;
        }
    }

    return {
        currentFee,
        labels,
        data,
        nextIncreaseMinutes,  // ← 追加で返す
    };
}
