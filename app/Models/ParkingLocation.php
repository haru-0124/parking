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
        "parking_type_id"
    ];

    public function getByLocation()
    {
        return $this->basic_fees()->with('parking_location')->orderBy('updated_at', 'DESC')->get();
    }
    public function parking_records()
    {
        return $this->hasMany(ParkingRecord::class);  
    }

    public function parking_type()
    {
        return $this->belongsTo(ParkingType::class);
    }

    public function basic_fees()
    {
        return $this->hasMany(BasicFee::class);
    }
}
