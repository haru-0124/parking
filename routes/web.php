<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ParkingLocationController;
use App\Http\Controllers\ParkingRecordController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/locations', [ParkingLocationController::class, 'index']);
    Route::get('/locations/register', [ParkingLocationController::class, 'register']);
    Route::get('/locations/{location}', [ParkingLocationController::class, "show"])->name('locations.show'); // ← ここを追加
    Route::get('/locations/{location}/edit', [ParkingLocationController::class, "edit"]);
    Route::put('/locations/{location}', [ParkingLocationController::class, "update"]);
    Route::post('/locations', [ParkingLocationController::class, 'store']);
    Route::post('/locations/{location}', [ParkingRecordController::class, 'store']);
    Route::delete("/locations/{location}", [ParkingLocationController::class, "destroy"]);
    Route::delete('/locations/{location}/unregister', [ParkingRecordController::class, 'destroy']);
});

require __DIR__.'/auth.php';
