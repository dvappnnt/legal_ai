<?php

namespace App\Http\Controllers;

use App\Models\LegalChunk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Helpers\PineconeHelper;

class AskController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('question');
    
        if (empty($question)) {
            return response()->json(['error' => 'Please provide a question!'], 400);
        }
    
        $embeddingResponse = Http::withToken(env('OPENAI_API_KEY'))
            ->post('https://api.openai.com/v1/embeddings', [
                'input' => $question,
                'model' => 'text-embedding-3-large',
            ]);
    
        if (!$embeddingResponse->successful()) {
            return response()->json(['error' => 'Failed to get embedding'], 500);
        }
    
        $questionEmbedding = $embeddingResponse->json()['data'][0]['embedding'];
    
        $pineconeResponse = \App\Helpers\PineconeHelper::query($questionEmbedding, 3);
        $matches = $pineconeResponse['matches'] ?? [];

        \Log::info('Pinecone matches', $matches);
    
        if (empty($matches)) {
            return response()->json(['answer' => "I don't know. I could not find anything relevant in the Constitution."]);
        }
    
        $context = '';
        foreach ($matches as $match) {
            if (!empty($match['metadata']['content'])) {
                $context .= $match['metadata']['content'] . "\n\n";
            }
        }
        
        \Log::info('Built context', ['length' => strlen($context)]);
    
        if (strlen($context) < 50) {
            return response()->json(['answer' => "I don't know. No relevant sections were found."]);
        }
    
        $prompt = <<<EOT
        You are a Philippine Legal AI Assistant.
        Answer using the following text sections from the Constitution.
        If the answer is not found, say so or provide your best legal guess — but make clear when you do so.
        Do not give information that is not in the context.
        Do not say "THE PROVIDED TEXT/CONTEXT" or "THE TEXT FOCUSES", just say that your knowledge is limited for now.
        Instead, infer as much as reasonably possible from the given input.
        If something is not stated, either make a plausible assumption based on context or omit mentioning it altogether.
        Do not speculate or ask for more information unless explicitly told to. Respond confidently and concisely,
        staying within the bounds of the source content.
        If the answer is found, arrange the answer in a way that is easy to understand and follow.

        
        Relevant sections:
        $context
        
        Question: $question
        EOT;
    
        $chatResponse = Http::withToken(env('OPENAI_API_KEY'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful Philippine legal assistant.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ],
                ],
            ]);
    
        if (!$chatResponse->successful()) {
            return response()->json(['error' => 'Failed to generate answer'], 500);
        }
    
        $answer = $chatResponse->json()['choices'][0]['message']['content'];
    
        return response()->json(['answer' => $answer]);
    }
    

    private function cosineSimilarity($a, $b)
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($a); $i++) {
            $dot += $a[$i] * $b[$i];
            $normA += $a[$i] * $a[$i];
            $normB += $b[$i] * $b[$i];
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }

    private function enhanceQuestion($question)
    {
        $question = strtolower(trim($question));
        
        // Check for article-specific questions
        if (preg_match('/article\s+([ivx]+)/i', $question, $matches)) {
            $articleNum = strtoupper($matches[1]);
            return "ARTICLE $articleNum content and provisions";
        }
        
        // Check for specific article mentions
        if (strpos($question, 'article i') !== false) {
            return "ARTICLE I National Territory Philippines Constitution";
        }
        if (strpos($question, 'article ii') !== false) {
            return "ARTICLE II Declaration of Principles State Policies Philippines Constitution";
        }
        if (strpos($question, 'article iii') !== false) {
            return "ARTICLE III Bill of Rights Philippines Constitution";
        }
        
        return $question;
    }
}
