<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingType extends Model
{
    use HasFactory;

    public function parking_locations()   
    {
        return $this->hasMany(ParkingLocation::class);  
    }
}
