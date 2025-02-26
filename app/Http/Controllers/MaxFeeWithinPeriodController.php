<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaxFeeWithinPeriod;
use App\Models\ParkingLocation;
use Inertia\Inertia;

class MaxFeeWithinPeriodController extends Controller
{
    public function destroy(ParkingLocation $location, MaxFeeWithinPeriod $mfwp)
    {
        $mfwp->delete();
        return redirect()->back()->with('message', '基本料金を削除しました');
    }
}
