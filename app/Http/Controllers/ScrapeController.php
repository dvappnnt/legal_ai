<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LegalChunk;
use Illuminate\Support\Facades\Http;

class ScrapeController extends Controller
{
    public function scrape(Request $request)
    {
        $url = $request->input('url');

        // Get the HTML
        $html = Http::get($url)->body();

        // Remove tags - very simple scrape
        $text = strip_tags($html);

        // Split into chunks
        $chunks = str_split($text, 500);

        foreach ($chunks as $chunk) {
            $response = Http::withToken(env('OPENAI_API_KEY'))
                ->post('https://api.openai.com/v1/embeddings', [
                    'input' => $chunk,
                    'model' => 'text-embedding-3-large',
                ]);

            $embedding = $response->json()['data'][0]['embedding'];

            LegalChunk::create([
                'content' => $chunk,
                'embedding' => $embedding,
                'source' => $url,
            ]);
        }

        return response()->json(['status' => 'Scraped & embedded']);
    }
}
