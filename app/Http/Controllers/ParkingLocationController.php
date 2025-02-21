<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ParkingType;
use App\Models\ParkingLocation;
use App\Models\ParkingRecord;

class ParkingLocationController extends Controller
{
    public function index()
    {
        return Inertia::render("ParkingLocation/Index",["locations" => ParkingLocation::with("parking_type")->get()]);
    }

    public function register()
    {
        return Inertia::render("ParkingLocation/Register", ["types" => ParkingType::all()]);
    }

    public function show(ParkingLocation $location)
    {
        $user = auth()->user();
        
        // 現在のユーザーがこの駐車場所に登録しているか確認
        $is_registered = ParkingRecord::where('parking_location_id', $location->id)
                                      ->where('user_id', $user->id)
                                      ->exists();
    
        return Inertia::render('ParkingLocation/Show', [
            'location' => $location->load('parking_type'),
            'auth' => ['user' => $user], 
            'is_registered' => $is_registered,
        ]);
    }
    
    public function edit(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/Edit",["location" => $location->load('parking_type'), "types" => ParkingType::all()]);
    }

    public function update(Request $request, ParkingLocation $location)
    {
        $input = $request->all();
        $location->fill($input)->save();
        return redirect("/locations/" . $location->id);
    }

    public function store(Request $request, ParkingLocation $location)
    {
        $input = $request->all();
        $location->fill($input)->save(); 
        return redirect("/locations");
    }

    public function destroy(ParkingLocation $location)
    {
        $location->delete();
        return redirect("/locations");
    }
}
