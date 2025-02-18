<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        "latitude",
        "longitude",
        "parking_types_id"
    ];
    public function parking_records()   
    {
        return $this->hasMany(ParkingRecord::class);  
    }

    public function parking_fees()   
    {
        return $this->hasMany(ParkingFee::class);  
    }

    public function parking_type()
    {
        return $this->belongsTo(ParkingType::class, 'parking_types_id');
    }
}
