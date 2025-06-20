import React, { useState, useEffect } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { generateFeeGraphDataWithNextIncrease } from '@/utils/parkingFee';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard({ auth, parkingRecords }) {
    const [chartDataList, setChartDataList] = useState({});
    const [nextIncreaseMinutesList, setNextIncreaseMinutesList] = useState({});
    const [currentFeeList, setCurrentFeeList] = useState({})
    const [now, setNow] = useState(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })));

    useEffect(() => {
        const chartData = {};
        const nextIncrease = {};
        const currentFee = {}

        parkingRecords.forEach((record, index) => {
            const result = generateFeeGraphDataWithNextIncrease(
                new Date(record.created_at),
                now,
                record.parking_location.basic_fees,
                record.parking_location.mfods,
                record.parking_location.mfoets
            );
    
            chartData[index] = {
                labels: result.labels,
                data: result.data,
            };
            nextIncrease[index] = result.nextIncreaseMinutes;
            currentFee[index] = result.currentFee;
        });
    
        setChartDataList(chartData);
        setNextIncreaseMinutesList(nextIncrease);
        setCurrentFeeList(currentFee);
    }, [parkingRecords, now]);
    console.log(nextIncreaseMinutesList)

    return (
        <AuthenticatedLayout user={auth.user} header={
            <div className="flex items-center space-x-4">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">駐車状況・料金確認</h2>
            </div>
        }>
            <Head title="駐車状況・料金確認" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900">
                        {parkingRecords.length > 0 ? (
                            <div>
                                <p className="font-bold mb-2">現在の駐車記録:</p>
                                <button
                                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
                                    onClick={() => setNow(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })))}
                                >
                                    現在時刻を更新
                                </button>
                                <ul className="list-disc pl-5 space-y-1">
                                    {parkingRecords.map((record, index) => (
                                        <li key={index}>
                                            {record.parking_location.name ?? '（名称未登録）'}（{new Date(record.created_at).toLocaleString()}）
                                            <div className="mt-4">
                                                <Link href={`/locations/${record.parking_location_id}`} className="text-blue-500">駐車場情報へ</Link>
                                            </div>
                                            <button
                                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                onClick={ () => router.delete(`/locations/${record.parking_location_id}/unregister`)}
                                            >
                                                駐車を終了する
                                            </button>
                                            <p>現在の料金は{currentFeeList[index]}円です</p>
                                            {nextIncreaseMinutesList[index] !== null ? (
                                                <p>あと {nextIncreaseMinutesList[index]} 分以内で料金が上がります</p>
                                            ) : (
                                                <p>今後24時間は料金が変わりません</p>
                                            )}
                                            {chartDataList[index] && (
                                                <div className="my-4">
                                                    <Line
                                                        data={{
                                                            labels: chartDataList[index].labels,
                                                            datasets: [{
                                                                label: '駐車料金（円）',
                                                                data: chartDataList[index].data,
                                                                borderColor: 'rgba(75,192,192,1)',
                                                                backgroundColor: 'rgba(75,192,192,0.2)',
                                                                tension: 0.1,
                                                            }]
                                                        }}
                                                        options={{
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    min: 0, // ← 下限を0に固定
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <p>駐車場所がまだ登録されていません</p>
                                <Link href={`/locations`} className="text-blue-500">駐車場を探す↗</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
