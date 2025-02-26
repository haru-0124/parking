<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaxFeeOnElapsedTime extends Model
{
    use HasFactory;

    protected $fillable = [
        "max_fee",
        "limit_time"
    ];

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);  
    }
}
