<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/fetch-parking', function (Request $request) {
    // パラメータの取得
    $location = $request->query('location', '34.7303,136.5086'); // デフォルト値
    $radius = $request->query('radius', 1500); // デフォルト値
    $type = 'parking'; // Google Maps APIで使用するタイプ

    // Google Maps APIのAPIキーを取得
    $apiKey = config('services.google_maps.key'); // 環境変数から取得

    // Google Maps APIのURL
    $url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={$location}&radius={$radius}&type={$type}&key={$apiKey}";

    // APIリクエストを送信
    $response = Http::get($url);

    // エラーハンドリング
    if ($response->failed()) {
        Log::error("Google Maps API request failed", ['url' => $url, 'status' => $response->status()]);
        return response()->json([
            'status' => 'error',
            'message' => '駐車場情報の取得に失敗しました。',
        ], 500);
    }

    // 取得したデータをJSON形式でデコード
    $data = $response->json();

    // APIから返されたデータをログに出力
    //Log::debug($data);

    $results = [];

    // 駐車場情報をデータベースに保存
    foreach ($data['results'] as $place) {
        $name = $place['name'] ?? null;
        $lat = $place['geometry']['location']['lat'] ?? null;
        $lng = $place['geometry']['location']['lng'] ?? null;
        $address = $place['vicinity'] ?? null;
        $place_id = $place['place_id'] ?? null;

        // データベースに保存されていない場所を追加
        if (!DB::table('parking_locations')->where('place_id', $place_id)->exists()) {
            DB::table('parking_locations')->insert([
                'name' => $name,
                'latitude' => $lat,
                'longitude' => $lng,
                'address' => $address,
                'place_id' => $place_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $results[] = $name;
        }
    }

    // 結果をJSONとして返す
    return response()->json([
        'status' => 'success',
        'saved' => $results
    ]);
});

