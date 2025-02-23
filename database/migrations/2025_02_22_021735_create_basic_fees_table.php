<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('basic_fees', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('parking_location_id')->constrained("parking_locations");
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration');
            $table->integer('fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('basic_fees');
    }
};
