<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingFee extends Model
{
    use HasFactory;

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);
    }
}
