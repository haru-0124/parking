<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaxFeeOnElapsedTime;
use App\Models\ParkingLocation;
use Inertia\Inertia;

class MaxFeeOnElapsedTimeController extends Controller
{
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParkingLocation $location, MaxFeeOnElapsedTime $mfoet)
    {
        $mfoet->delete();
        return redirect()->back()->with('message', '基本料金を削除しました');
    }
}
