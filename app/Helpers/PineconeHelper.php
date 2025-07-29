<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;

class PineconeHelper
{
    public static function upsert(array $vectors)
    {
        $apiKey = env('PINECONE_API_KEY');
        $host = env('PINECONE_HOST');
        $indexName = env('PINECONE_INDEX_NAME');

        $url = "{$host}/vectors/upsert";

        try {
            $response = Http::withHeaders([
                'Api-Key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'vectors' => $vectors
            ]);

            if (!$response->successful()) {
                \Log::error('Pinecone upsert failed', [
                    'error' => $response->body()
                ]);
            }

            return $response->json();
        } catch (\Exception $e) {
            \Log::error('Pinecone upsert exception', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    public static function query(array $embedding, int $topK = 3)
    {
        $apiKey = env('PINECONE_API_KEY');
        $host = env('PINECONE_HOST');
        $indexName = env('PINECONE_INDEX_NAME');

        $url = "{$host}/query";

        try {
            $response = Http::withHeaders([
                'Api-Key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'vector' => $embedding,
                'topK' => $topK,
                'includeMetadata' => true
            ]);

            if (!$response->successful()) {
                \Log::error('Pinecone query failed', [
                    'error' => $response->body()
                ]);
            }

            return $response->json();
        } catch (\Exception $e) {
            \Log::error('Pinecone query exception', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
