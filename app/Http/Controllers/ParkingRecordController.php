<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ParkingRecord;
use App\Models\ParkingLocation;

class ParkingRecordController extends Controller
{
    public function store(Request $request, ParkingLocation $location)
    {
        $user = auth()->user();

        // すでに登録されているか確認
        if (ParkingRecord::where('parking_location_id', $location->id)
                        ->where('user_id', $user->id)
                        ->exists()) {
            return redirect()->route('locations.show', $location)
                            ->withErrors(['message' => 'すでに登録されています']);
        }

        // 駐車記録を作成
        ParkingRecord::create([
            'parking_location_id' => $location->id,
            'user_id' => $user->id,
        ]);

        return redirect()->route('locations.show', $location)
                        ->with('success', '駐車場所を登録しました');
    }

    public function destroy(ParkingLocation $location)
    {
        $user = auth()->user();

        // ユーザーの該当する駐車記録を削除
        ParkingRecord::where('parking_location_id', $location->id)
                     ->where('user_id', $user->id)
                     ->delete();

        return back()->with('message', '駐車場所の登録を解除しました');
    }

}
