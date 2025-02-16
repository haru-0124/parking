<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParkingTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('parking_types')->insert([
            [
                'name' => 'ロック板式',
                'description' => 'ロック板が車を固定する仕組みです',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ゲート式',
                'description' => '出入り口のゲートで入出庫を管理する仕組みです',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '前払式',
                'description' => '事前に停めておく時間分のチケットを購入する仕組みです',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ロックレス(ナンバー読み取り)式',
                'description' => 'カメラでナンバーを読み取る仕組みです',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '完全キャッシュレス式',
                'description' => 'キャッシュレス決済のみに対応する仕組みです',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
