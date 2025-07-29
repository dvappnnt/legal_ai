<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\ScrapeController;
use App\Http\Controllers\AskController;
use App\Models\Question;

Route::get('/test-api', function () {
    return 'API works!';
});

Route::get('/test-upload', function () {
    return response()->json([
        'message' => 'Upload endpoint is accessible',
        'storage_path' => storage_path('app/private/uploads'),
        'storage_exists' => file_exists(storage_path('app/private/uploads')),
        'openai_key' => env('OPENAI_API_KEY') ? 'Set' : 'Not set'
    ]);
});
Route::post('/upload', [UploadController::class, 'store']);
Route::post('/scrape', [ScrapeController::class, 'scrape']);

Route::post('/ask', [AskController::class, 'ask']);
Route::get('/questions', function () {
    return Question::latest()->get();
});