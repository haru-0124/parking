<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaxFeeWithinPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        "max_fee",
        "start_time",
        "end_time"
    ];

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);  
    }
}
