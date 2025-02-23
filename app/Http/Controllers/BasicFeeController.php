<?php

namespace App\Http\Controllers;

use App\Models\BasicFee;
use App\Models\ParkingLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BasicFeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(ParkingLocation $location)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(BasicFee $basicFee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BasicFee $basicFee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BasicFee $basicFee)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParkingLocation $location, BasicFee $basicfee)
    {
        $basicfee->delete();
        return redirect()->back()->with('message', '基本料金を削除しました');
    }
}
