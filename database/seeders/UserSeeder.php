<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (! User::where('email', 'akinlajatimileyin@gmail.com')->exists()) {
            User::insert([
                'name'              => 'Timileyin Akinlaja',
                'email'             => 'akinlajatimileyin@gmail.com',
                'password'          => Hash::make('Timi@2020'),
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
    }
}
