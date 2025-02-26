<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaxFeeOnDay;
use App\Models\ParkingLocation;
use Inertia\Inertia;

class MaxFeeOnDayController extends Controller
{
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParkingLocation $location, MaxFeeOnDay $mfod)
    {
        $mfod->delete();
        return redirect()->back()->with('message', '基本料金を削除しました');
    }
}
