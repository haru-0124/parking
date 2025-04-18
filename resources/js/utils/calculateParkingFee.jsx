export function calculateParkingFee(startTime, endTime, basic_fees, mfods) {
  // 複雑なロジックはここに
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

    function nonOverlapFee(startHour, endHour, fee, feeStart, feeEnd, parkingMinutes, mfods, state) {
        //期間をまたがない場合の計算
        let nonOverlapFee = 0
        //駐車時間がfeeStartとfeeEndの間に収まる
        if ((feeStart <= startHour) && (endHour <= feeEnd)) {
            //基本料金の計算
            nonOverlapFee = Math.ceil(parkingMinutes / fee.duration) * fee.fee
            state.is_overlapped = false
            //最大料金の適用
            let maxFees = [nonOverlapFee];
            if (mfods[0]?.max_fee != null) {
                maxFees.push(mfods[0].max_fee);
            }
            if (fee?.max_fee != null) {
                maxFees.push(fee.max_fee);
            }
            nonOverlapFee = Math.min(...maxFees);
            console.log(`nonOverlapFee ${startHour}~${endHour}: ${nonOverlapFee}`)
        }
        return nonOverlapFee
    }

    function periodOverlapFeeBefore(startHour, endHour, fee, feeStart, feeEnd, startMinutes) {
        //期間をまたぐときのまたぐ前の部分の計算
        let periodOverlapMinutesBefore = 0
        let periodOverlapFeeBefore = 0
        //駐車開始時間はfeeStartとfeeEndの間に収まるが、駐車終了時間はfeeEndのあとになる」
        if ((feeStart <= startHour) && (startHour < feeEnd) && (feeEnd < endHour)) {
            /*
                またぐ前
            */
            periodOverlapMinutesBefore = (timeToMinutes(feeEnd) - startMinutes)
            periodOverlapFeeBefore = Math.ceil(periodOverlapMinutesBefore / fee.duration) * fee.fee
            if (fee?.max_fee != null) {
                periodOverlapFeeBefore = Math.min(periodOverlapFeeBefore, fee.max_fee);
            }
            console.log(`periodOverlapFeeBefore ${startHour}~${feeEnd}:${periodOverlapFeeBefore}`)
        }
        return periodOverlapFeeBefore
    }

    function periodOverlapFeeAfter(startHour, endHour, fee, feeStart, feeEnd, endMinutes) {
        //期間をまたぐときのまたいだ後の計算
        let periodOverlapMinutesAfter = 0
        let periodOverlapFeeAfter = 0
        //駐車開始時間はfeeStartより前で駐車終了時間はfeeStartより後
        if ((startHour < feeStart) && (feeStart < endHour)) {
            /*
                またいだ後
            */
            if (endHour <= feeEnd) {
                //これ以上期間を超えない場合
                periodOverlapMinutesAfter = (endMinutes - timeToMinutes(feeStart))
                periodOverlapFeeAfter = Math.ceil(periodOverlapMinutesAfter / fee.duration) * fee.fee
                if (fee?.max_fee != null) {
                    periodOverlapFeeAfter = Math.min(periodOverlapFeeAfter, fee.max_fee);
                }
                console.log(`periodOverlapFeeAfter ${feeStart}~${endHour}:${periodOverlapFeeAfter}`)
            } else {
                //さらに期間を超えて駐車する場合
                periodOverlapMinutesAfter = (timeToMinutes(feeEnd) - timeToMinutes(feeStart))
                periodOverlapFeeAfter = Math.ceil(periodOverlapMinutesAfter / fee.duration) * fee.fee
                if (fee?.max_fee != null) {
                    periodOverlapFeeAfter = Math.min(periodOverlapFeeAfter, fee.max_fee);
                }
                console.log(`periodoverlapafter ${feeStart}~${feeEnd}:${periodOverlapFeeAfter}`)
            }
        }
        return periodOverlapFeeAfter
    }

    function nonDayOverlapFee(startHour, endHour, parkingMinutes, basic_fees, mfods, startMinutes, endMinutes, state) {
        //日をまたがないときの計算をまとめたもの
        let nonDayOverlapFee = 0
        basic_fees.forEach(fee => {
            //期間をまたがない
            if (fee.start_time < fee.end_time) {
                nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, fee.start_time, fee.end_time, parkingMinutes, mfods, state)
            } else {
                nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, "00:00:00", fee.end_time, parkingMinutes, mfods, state)
                nonDayOverlapFee += nonOverlapFee(startHour, endHour, fee, fee.start_time, "24:00:00", parkingMinutes, mfods, state)
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
                    nonDayOverlapFee += periodOverlapFeeAfter(startHour, endHour, fee, fee.start_time, fee.end_time, endMinutes)
                } else {
                    /*
                        基本料金が日をまたぐ
                    */
                    nonDayOverlapFee += periodOverlapFeeBefore(startHour, endHour, fee, "00:00:00", fee.end_time, startMinutes)
                    nonDayOverlapFee += periodOverlapFeeAfter(startHour, endHour, fee, fee.start_time, "24:00:00", endMinutes)
                }
            });
            if (mfods[0]?.max_fee != null) {
                nonDayOverlapFee = Math.min(mfods[0].max_fee, nonDayOverlapFee)
            }
            console.log(`1日の合計${nonDayOverlapFee}`)
        }
        state.is_overlapped = true
        return nonDayOverlapFee
    }

    function calculateByBasicFee(parkingDate, startHour, startMinutes, endHour, endMinutes, basic_fees){
        console.log(`基本料金で計算`)
        let overDayFee = 0; //18:00~6:00の区間にかかる料金
        let nonOverDayFee = 0; //6:00~18:00の区間にかかる料金
        let overDayBasicFee = 0
        let nonOverDayBasicFee = 0
        let startDayFee = 0
        let endDayFee = 0
        
        basic_fees.forEach(fee => {
            if(fee.start_time < fee.end_time){
                nonOverDayBasicFee = fee
            } else {
                overDayBasicFee = fee
            }
        })

        //2日間停めた時
        if(parkingDate == 2){
            console.log("2日間停めた")
            //駐車時間が18:00~6:00に収まっている場合
            if(startHour >= overDayBasicFee.start_time && endHour <= overDayBasicFee.end_time){
                //停めた時間分料金を加算する
                overDayFee = Math.ceil(parkingMinutes / overDayBasicFee.duration) * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    overDayFee = Math.min(overDayFee, overDayBasicFee.max_fee);
                }
            //入庫時間と出庫時間のどちらも18:00~6:00の時間外の時
            } else if (startHour < overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                //18:00~6:00にかかった料金をoverDayFeeに入れる
                overDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                        +(timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                        / overDayBasicFee.duration)
                                        * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    overDayFee = Math.min(overDayFee, overDayBasicFee.max_fee);
                }
                //入庫～18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfods,startMinutes,timeToMinutes(overDayBasicFee.start_time),state)
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
            //入庫時間は18:00~24:00に収まっていて、出庫時間が6:00以降の場合
            } else if (startHour >= overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                //入庫~6:00までの料金をoverDayFeeに入れる
                overDayFee = Math.ceil(((timeToMinutes("24:00:00")-startMinutes)
                                        +(timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                        / overDayBasicFee.duration)
                                        * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    overDayFee = Math.min(overDayFee, overDayBasicFee.max_fee);
                }
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
            //入庫時間が18:00より前で、出庫時間が0:00~6:00に収まっている場合
            } else if (startHour < overDayBasicFee.start_time && endHour <= overDayBasicFee.end_time) {
                //18:00~出庫までの料金をoverDayFeeに入れる
                overDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                        +(endMinutes - timeToMinutes("0:00:00")))
                                        / overDayBasicFee.duration)
                                        * overDayBasicFee.fee
                
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    overDayFee = Math.min(overDayFee, overDayBasicFee.max_fee);
                }
                //入庫~18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfods,startMinutes,timeToMinutes(overDayBasicFee.start_time),state)
            }
            console.log(`overDayFee ${overDayFee}`)
            console.log(`startDayFee ${startDayFee}`)
            console.log(`endDayFee ${endDayFee}`)
            totalFee = overDayFee + startDayFee + endDayFee
        //3日以上停めた場合
        } else if (parkingDate >= 3){
            let unitOverDayFee = 0
            //初日の入庫時間と最終日の出庫時間がそれぞれ18:00~24:00、0:00~6:00に収まっていない場合
            if(startHour < overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                //18:00~6:00に停めた分の合計料金をoverDayFeeに入れる
                overDayFee = Math.ceil((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time))/overDayBasicFee.duration)*overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    overDayFee = Math.min(overDayFee, overDayBasicFee.max_fee);
                }
                overDayFee *= parkingDate - 1
                //6:00~18:00に停めた分の合計料金をnonOverDayFeeに入れる
                nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)*nonOverDayBasicFee.fee
                //時間帯内最大料金の適用
                if (nonOverDayBasicFee?.max_fee != null) {
                    nonOverDayFee = Math.min(nonOverDayFee, nonOverDayBasicFee.max_fee);
                }
                nonOverDayFee *= parkingDate - 2
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //入庫~18:00までの料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfods,startMinutes,timeToMinutes(overDayBasicFee.start_time),state)
                //6:00~出庫までの料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
            //初日の入庫時間と最終日の共に18:00~6:00の枠に収まっている場合
            } else if (startHour >= overDayBasicFee.start_time && endHour <= overDayBasicFee.end_time){
                //入庫~6:00までの料金をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes("24:00:00")-startMinutes)+(timeToMinutes(overDayBasicFee.end_time)
                                            -timeToMinutes("00:00:00"))) 
                                            / overDayBasicFee.duration) 
                                            * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee);
                }
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //18:00~出庫までの料金をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                            +(endMinutes-timeToMinutes("0:00:00")))
                                            / overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee)
                }
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration) * overDayBasicFee.fee * (parkingDate - 3)
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee * (parkingDate - 3)) 
                }
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)*nonOverDayBasicFee.fee
                //時間帯内最大料金の適用
                if (nonOverDayBasicFee?.max_fee != null) {
                    nonOverDayFee = Math.min(nonOverDayFee, nonOverDayBasicFee.max_fee);
                }
                nonOverDayFee *= (parkingDate -2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
            //初日の入庫時間は18:00~24:00に収まっているが、最終日の出庫時間が6時以降の場合
            } else if (startHour >= overDayBasicFee.start_time && endHour > overDayBasicFee.end_time){
                //入庫~6:00までまでにかかる料金をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes("24:00:00")-startMinutes)
                                            + (timeToMinutes(overDayBasicFee.end_time)-timeToMinutes("00:00:00")))
                                            / overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee)
                }
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration)*overDayBasicFee.fee * (parkingDate - 2)
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee * (parkingDate - 2))
                }
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)*nonOverDayBasicFee.fee
                //時間帯内最大料金の適用
                if (nonOverDayBasicFee?.max_fee != null) {
                    nonOverDayFee = Math.min(nonOverDayFee, nonOverDayBasicFee.max_fee);
                }
                nonOverDayFee *= (parkingDate - 2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //6:00~出庫にかかる料金をendDayFeeに入れる
                endDayFee = nonDayOverlapFee(overDayBasicFee.end_time,endHour,endMinutes-timeToMinutes(overDayBasicFee.end_time),basic_fees,mfods,timeToMinutes(overDayBasicFee.end_time),endMinutes,state)
            //初日の入庫時間が18:00より前で、最終日の出庫時間は0:00~6:00に収まっている場合
            } else if (startHour < overDayBasicFee.start_time && endHour <= overDayBasicFee.end_time){
                //18:00~出庫までにかかる料金をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes("24:00:00")-timeToMinutes(overDayBasicFee.start_time))
                                            + (endMinutes-timeToMinutes("0:00:00")))
                                            /overDayBasicFee.duration)
                                            * overDayBasicFee.fee
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee)
                }
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //中日にある18:00~6:00に停めた分の料金の合計をoverDayFeeに加算する
                unitOverDayFee = Math.ceil(((timeToMinutes(overDayBasicFee.start_time)-timeToMinutes(overDayBasicFee.end_time)))/overDayBasicFee.duration) * overDayBasicFee.fee * (parkingDate - 2)
                //時間帯内最大料金の適用
                if (overDayBasicFee?.max_fee != null) {
                    unitOverDayFee = Math.min(unitOverDayFee, overDayBasicFee.max_fee * (parkingDate - 2))
                }
                console.log(unitOverDayFee)
                overDayFee += unitOverDayFee
                //6:00~18:00に停めた分の料金の合計をnonOverDayFeeに入れる
                nonOverDayFee = Math.ceil((timeToMinutes(nonOverDayBasicFee.end_time)-timeToMinutes(nonOverDayBasicFee.start_time))/nonOverDayBasicFee.duration)*nonOverDayBasicFee.fee
                //時間帯内最大料金の適用
                if (nonOverDayBasicFee?.max_fee != null) {
                    nonOverDayFee = Math.min(nonOverDayFee, nonOverDayBasicFee.max_fee);
                }
                nonOverDayFee *= (parkingDate - 2)
                console.log(`overDayFee${overDayFee}`)
                console.log(`nonOverDayFee${nonOverDayFee}`)
                //入庫~18:00にかかる料金をstartDayFeeに入れる
                startDayFee = nonDayOverlapFee(startHour, overDayBasicFee.start_time,timeToMinutes(overDayBasicFee.start_time)-startMinutes,basic_fees,mfods,startMinutes,timeToMinutes(overDayBasicFee.start_time),state)
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
        totalFee = nonDayOverlapFee(startHour, endHour, parkingMinutes, basic_fees,  mfods, startMinutes, endMinutes, state)
    } else {
        //日にちをまたぐ
        console.log("日にちをまたぐ")
        let parkingDate = endDate - startDate + 1

        let startDayFee = 0;//入庫～18:00にかかる料金
        let endDayFee = 0; //6:00~出庫にかかる料金
        let middleDaysFee = 0;
        let totalFee = calculateByBasicFee(parkingDate, startHour, startMinutes, endHour, endMinutes, basic_fees)
        
        if (mfods[0]?.max_fee != null) {
            if(parkingDate == 2){
                // startHour から 24:00 までの料金計算
                startDayFee = nonDayOverlapFee(startHour, "24:00:00", timeToMinutes("24:00:00") - startMinutes ,basic_fees,  mfods, startMinutes, timeToMinutes("24:00:00"), state)
                startDayFee = Math.min(startDayFee,mfods[0].max_fee)
                // 0:00 から endHour までの料金計算
                endDayFee = nonDayOverlapFee("00:00:00", endHour, endMinutes, basic_fees,  mfods, timeToMinutes("00:00:00"), endMinutes, state)
                endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                totalFee = Math.min(totalFee, startDayFee + endDayFee)
            } else if (parkingDate >= 3){
                // startHour から 24:00 までの料金計算
                startDayFee = nonDayOverlapFee(startHour, "24:00:00", timeToMinutes("24:00:00") - startMinutes ,basic_fees,  mfods, startMinutes, timeToMinutes("24:00:00"), state)
                startDayFee = Math.min(startDayFee,mfods[0].max_fee)
                // 0:00 から endHour までの料金計算
                endDayFee = nonDayOverlapFee("00:00:00", endHour, endMinutes, basic_fees,  mfods, timeToMinutes("00:00:00"), endMinutes, state)
                endDayFee = Math.min(endDayFee, mfods[0].max_fee)
                //中間の日の料金
                middleDaysFee = mfods[0].max_fee * (parkingDate - 2)
                totalFee = Math.min(totalFee, startDayFee + middleDaysFee + endDayFee)
            }
        }
    console.log(`startDayFee: ${startDayFee}円, middleDaysFee: ${middleDaysFee}, endDayFee: ${endDayFee}円, totalFee: ${totalFee}円`);
    }
    return totalFee;
};