<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ParkingType;
use App\Models\ParkingLocation;
use App\Models\ParkingRecord;
use App\Models\BasicFee;
use App\Models\MaxFeeOnDay;
use App\Models\MaxFeeOnElapsedTime;
use App\Models\MaxFeeWithinPeriod;

class ParkingLocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("ParkingLocation/Index",["locations" => ParkingLocation::with("parking_type")->get()]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("ParkingLocation/Create", ["types" => ParkingType::all()]);
    }

    public function createBasicFee(ParkingLocation $location)
    {
        return Inertia::render('ParkingLocation/CreateBasicFee', [
            'location' => $location,
        ]);
    }

    public function createOnDay(ParkingLocation $location)
    {
        return Inertia::render('ParkingLocation/CreateOnDay', [
            'location' => $location,
        ]);
    }

    public function createOnElapsedTime(ParkingLocation $location)
    {
        return Inertia::render('ParkingLocation/CreateOnElapsedTime', [
            'location' => $location,
        ]);
    }

    public function createWithinPeriod(ParkingLocation $location)
    {
        return Inertia::render('ParkingLocation/CreateWithinPeriod', [
            'location' => $location,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ParkingLocation $location)
    {
        $input = $request->all();
        $location->fill($input)->save(); 
        return redirect("/locations");
    }

    public function storeBasicFee(Request $request, ParkingLocation $location)
    {
        $request->validate([
            'start_time' => 'required',
            'end_time' => 'required',
            'duration' => 'required|integer',
            'fee' => 'required|integer',
        ]);

        $location->basic_fees()->create([
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration' => $request->duration,
            'fee' => $request->fee,
        ]);

        return redirect("/locations/{$location->id}/basicfees")
            ->with('success', '基本料金が編集されました。');
    }

    public function storeOnDay(Request $request, ParkingLocation $location)
    {
        $request->validate([
            'max_fee' => 'required',
        ]);

        $location->max_fee_on_days()->create([
            'max_fee' => $request->max_fee,
        ]);

        return redirect("/locations/{$location->id}/mfods")
            ->with('success', '最大料金が編集されました。');
    }

    public function storeOnElapsedTime(Request $request, ParkingLocation $location)
    {
        $request->validate([
            'max_fee' => 'required',
            'limit_time' => 'required',
        ]);

        $location->max_fee_on_elapsed_times()->create([
            'max_fee' => $request->max_fee,
            'limit_time' => $request->limit_time,
        ]);

        return redirect("/locations/{$location->id}/mfoets")
            ->with('success', '最大料金が編集されました。');
    }

    public function storeWithinPeriod(Request $request, ParkingLocation $location)
    {
        $request->validate([
            'max_fee' => 'required',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $location->max_fee_within_periods()->create([
            'max_fee' => $request->max_fee,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return redirect("/locations/{$location->id}/mfwps")
            ->with('success', '最大料金が編集されました。');
    }

    /**
     * Display the specified resource.
     */
    public function show(ParkingLocation $location)
    {
        $user = auth()->user();
        
        // 現在のユーザーがこの駐車場所に登録しているか確認
        $is_registered = ParkingRecord::where('parking_location_id', $location->id)
                                      ->where('user_id', $user->id)
                                      ->exists();
    
        return Inertia::render('ParkingLocation/Show', [
            'location' => $location->load('parking_type'),
            'basic_fees' => $location->getByLocation(),
            'mfods' => $location->getByLocationOnDay(),
            'mfoets' => $location->getByLocationOnElapsedTime(),
            'mfwps' => $location->getByLocationWithinPeriod(),
            'auth' => ['user' => $user], 
            'is_registered' => $is_registered,
        ]);
    }

    public function showBasicFees(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/ShowBasicFees",["basic_fees" => $location->getByLocation()]);
    }

    public function showOnDays(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/ShowOnDays",["max_fees" => $location->getByLocationOnDay()]);
    }

    public function showOnElapsedTimes(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/ShowOnElapsedTimes",["max_fees" => $location->getByLocationOnElapsedTime()]);
    }

    public function showWithinPeriods(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/ShowWithinPeriods",["max_fees" => $location->getByLocationWithinPeriod()]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/Edit",["location" => $location->load('parking_type'), "types" => ParkingType::all()]);
    }

    public function editBasicFee(ParkingLocation $location, BasicFee $basicfee)
    {
        return Inertia::render('ParkingLocation/EditBasicFee', ['basic_fee' => $basicfee]);
    }

    public function editOnDay(ParkingLocation $location, MaxFeeOnDay $mfod)
    {
        return Inertia::render('ParkingLocation/EditOnDay', ['max_fee' => $mfod]);
    }

    public function editOnElapsedTime(ParkingLocation $location, MaxFeeOnElapsedTime $mfoet)
    {
        return Inertia::render('ParkingLocation/EditOnElapsedTime', ['max_fee' => $mfoet]);
    }

    public function editWithinPeriod(ParkingLocation $location, MaxFeeWithinPeriod $mfwp)
    {
        return Inertia::render('ParkingLocation/EditWithinPeriod', ['max_fee' => $mfwp]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ParkingLocation $location)
    {
        $input = $request->all();
        $location->fill($input)->save();
        return redirect("/locations/" . $location->id);
    }

    public function updateBasicFee(Request $request, ParkingLocation $location, BasicFee $basicfee)
    {
        $request->validate([
            'start_time' => 'required',
            'end_time' => 'required',
            'duration' => 'required|integer',
            'fee' => 'required|integer',
        ]);

        $basicfee->update($request->only(['start_time', 'end_time', 'duration', 'fee']));

        return redirect("/locations/{$location->id}/basicfees")
        ->with('success', '基本料金が設定されました。');
    }

    public function updateOnDay(Request $request, ParkingLocation $location, MaxFeeOnDay $mfod)
    {
        $request->validate([
            'max_fee' => 'required',
        ]);

        $mfod->update($request->only(['max_fee']));

        return redirect("/locations/{$location->id}/mfods")
        ->with('success', '基本料金が設定されました。');
    }

    public function updateOnElapsedTime(Request $request, ParkingLocation $location, MaxFeeOnElapsedTime $mfoet)
    {
        $request->validate([
            'max_fee' => 'required',
            'limit_time' => 'required',
        ]);

        $mfoet->update($request->only(['max_fee', 'limit_time']));

        return redirect("/locations/{$location->id}/mfoets")
        ->with('success', '基本料金が設定されました。');
    }

    public function updateWithinPeriod(Request $request, ParkingLocation $location, MaxFeeWithinPeriod $mfwp)
    {
        $request->validate([
            'max_fee' => 'required|integer',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $mfwp->update($request->only(['max_fee', 'start_time', 'end_time']));

        return redirect("/locations/{$location->id}/mfwps")
        ->with('success', '基本料金が設定されました。');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParkingLocation $location)
    {
        $location->delete();
        return redirect("/locations");
    }
}
