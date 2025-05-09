<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ParkingLocationController;
use App\Http\Controllers\ParkingRecordController;
use App\Http\Controllers\BasicFeeController;
use App\Http\Controllers\MaxFeeOnDayController;
use App\Http\Controllers\MaxFeeOnElapsedTimeController;
use App\Http\Controllers\MaxFeeWithinPeriodController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\ParkingRecord;

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
    $user = Auth::user();

    $parkingRecords = ParkingRecord::with([
        'parkingLocation',
        'parkingLocation.basicFees',
        'parkingLocation.mfods',
        'parkingLocation.mfoets',
        ])
        ->where('user_id', $user->id)
        ->latest()
        ->get();

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'parkingRecords' => $parkingRecords->toArray(),
        ]);
        
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    //index データ一覧表示
    Route::get('/locations', [ParkingLocationController::class, 'index'])->name('index');

    //create 新しいデータの作成画面を表示
    Route::get('/locations/register', [ParkingLocationController::class, 'create']);
    Route::get('/locations/{location}/basicfees/register', [ParkingLocationController::class, "createBasicFee"]);
    Route::get('/locations/{location}/mfods/register', [ParkingLocationController::class, "createOnDay"]);
    Route::get('/locations/{location}/mfoets/register', [ParkingLocationController::class, "createOnElapsedTime"]);

    //store 作成したデータの送信・保存
    Route::post('/locations', [ParkingLocationController::class, 'store']);
    Route::post('/locations/{location}', [ParkingRecordController::class, 'store']);
    Route::post('/locations/{location}/basicfees', [ParkingLocationController::class, 'storeBasicFee']);
    Route::post('/locations/{location}/mfods', [ParkingLocationController::class, 'storeOnDay']);
    Route::post('/locations/{location}/mfoets', [ParkingLocationController::class, 'storeOnElapsedTime']);

    //show データの詳細表示
    Route::get('/locations/{location}', [ParkingLocationController::class, "show"])->name('locations.show');
    Route::get('/locations/{location}/basicfees', [ParkingLocationController::class, "showBasicFees"]);
    Route::get('/locations/{location}/mfods', [ParkingLocationController::class, 'showOnDays']);
    Route::get('/locations/{location}/mfoets', [ParkingLocationController::class, 'showOnElapsedTimes']);

    //edit 既存のデータの編集画面を表示
    Route::get('/locations/{location}/edit', [ParkingLocationController::class, "edit"]);
    Route::get('/locations/{location}/basicfees/{basicfee}/edit', [ParkingLocationController::class, "editBasicFee"]);
    Route::get('/locations/{location}/mfods/{mfod}/edit', [ParkingLocationController::class, 'editOnDay']);
    Route::get('/locations/{location}/mfoets/{mfoet}/edit', [ParkingLocationController::class, 'editOnElapsedTime']);

    //update　編集前のデータと編集後のデータの置換
    Route::put('/locations/{location}', [ParkingLocationController::class, "update"]);
    Route::put('/locations/{location}/basicfees/{basicfee}', [ParkingLocationController::class, "updateBasicFee"]);
    Route::put('/locations/{location}/mfods/{mfod}', [ParkingLocationController::class, 'updateOnDay']);
    Route::put('/locations/{location}/mfoets/{mfoet}', [ParkingLocationController::class, 'updateOnElapsedTime']);

    //destroy データの削除
    Route::delete("/locations/{location}", [ParkingLocationController::class, "destroy"]);
    Route::delete('/locations/{location}/unregister', [ParkingRecordController::class, 'destroy']);
    Route::delete('/locations/{location}/basicfees/{basicfee}', [BasicFeeController::class, 'destroy']);
    Route::delete('/locations/{location}/mfods/{mfod}', [MaxFeeOnDayController::class, 'destroy']);
    Route::delete('/locations/{location}/mfoets/{mfoet}', [MaxFeeOnElapsedTimeController::class, 'destroy']);
});

require __DIR__.'/auth.php';
