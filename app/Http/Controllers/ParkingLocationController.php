<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ParkingType;
use App\Models\ParkingLocation;

class ParkingLocationController extends Controller
{
    public function register(ParkingType $type)
    {
        return Inertia::render("ParkingLocation/Register", ["types" => $type->get()]);
    }

    public function store(Request $request, ParkingLocation $location)
    {
        $input = $request->all();
        $location->fill($input)->save(); 
        return redirect("/");
    }
}
