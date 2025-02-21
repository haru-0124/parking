<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingRecord extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'parking_location_id'];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parking_location()
    {
        return $this->belongsTo(ParkingLocation::class);
    }
}
