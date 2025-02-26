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
        Schema::create('max_fee_on_elapsed_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parking_location_id')->constrained("parking_locations");
            $table->integer('max_fee');
            $table->integer('limit_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('max_fee_on_elapsed_times');
    }
};
