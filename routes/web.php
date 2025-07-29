<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/chat', function () {
    return Inertia::render('Chat');
});

Route::get('/legal-ai-chat', function () {
    return Inertia::render('LegalAiChat');
});

Route::get('/main', function () {
    return Inertia::render('Main');
});

Route::get('/meeting/{roomId}', function ($roomId) {
    return Inertia::render('MeetingEntry', [
        'roomId' => $roomId
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
