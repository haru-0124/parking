<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ParkingType;
use App\Models\ParkingLocation;

class ParkingLocationController extends Controller
{
    public function index(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/Index",["locations" => ParkingLocation::with("parking_type")->get()]);
    }

    public function register(ParkingType $type)
    {
        return Inertia::render("ParkingLocation/Register", ["types" => $type->get()]);
    }

    public function show(ParkingLocation $location)
    {
        return Inertia::render("ParkingLocation/Show",["location" => $location->load('parking_type')]);
    }

    public function edit(ParkingLocation $location, ParkingType $type)
    {
        return Inertia::render("ParkingLocation/Edit",["location" => $location, "types" => $type->get()]);
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

    public function delete(ParkingLocation $location)
    {
        $location->delete();
        return redirect("/locations");
    }
}
