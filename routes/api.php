<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidateController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NoteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| HireTrack API Routes
|--------------------------------------------------------------------------
*/

// ── Public auth routes ────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login',  [AuthController::class, 'login']);
});

// ── Protected routes (require Sanctum token) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('dashboard/stats',           [DashboardController::class, 'stats']);
    Route::get('dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Candidates
    Route::apiResource('candidates', CandidateController::class);
    Route::patch('candidates/{candidate}/stage',      [CandidateController::class, 'updateStage']);
    Route::get('candidates/{candidate}/activities',   [CandidateController::class, 'activities']);

    // Notes
    Route::get('candidates/{candidate}/notes',  [NoteController::class, 'index']);
    Route::post('candidates/{candidate}/notes', [NoteController::class, 'store']);
    Route::delete('notes/{note}',               [NoteController::class, 'destroy']);
});
