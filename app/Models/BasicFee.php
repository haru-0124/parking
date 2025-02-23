<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BasicFee extends Model
{
    use HasFactory;

    protected $fillable = [
        "start_time",
        "end_time",
        "duration",
        "fee"
    ];

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);  
    }
}
