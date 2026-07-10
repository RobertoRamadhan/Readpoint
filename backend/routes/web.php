<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Login route for middleware redirect (API requests will use exception handler instead)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthorized'], 401);
})->name('login');

// Temporary seed route - will be removed after seeding
Route::get('/run-seed', function () {
    $key = request()->query('key');
    if ($key !== env('APP_KEY')) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        $output = \Illuminate\Support\Facades\Artisan::output();
        return response()->json(['message' => 'Seeded successfully', 'output' => $output]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Seed failed: ' . $e->getMessage()], 500);
    }
});
