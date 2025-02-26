<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaxFeeOnDay extends Model
{
    use HasFactory;

    protected $fillable = [
        "max_fee",
    ];

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);  
    }
}
