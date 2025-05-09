<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "latitude",
        "longitude",
        "address",
        "parking_type_id",
    ];

    public function getByLocation()
    {
        return $this->basicFees()->with('parking_location')->orderBy('updated_at', 'DESC')->get();
    }

    public function getByLocationOnDay()
    {
        return $this->mfods()->with('parking_location')->orderBy('updated_at', 'DESC')->get();
    }

    public function getByLocationOnElapsedTime()
    {
        return $this->mfoets()->with('parking_location')->orderBy('updated_at', 'DESC')->get();
    }

    public function parkingRecords()
    {
        return $this->hasMany(ParkingRecord::class);  
    }

    public function parkingType()
    {
        return $this->belongsTo(ParkingType::class);
    }

    public function basicFees()
    {
        return $this->hasMany(BasicFee::class);
    }

    public function mfods()
    {
        return $this->hasMany(MaxFeeOnDay::class);
    }

    public function mfoets()
    {
        return $this->hasMany(MaxFeeOnElapsedTime::class);
    }
}
