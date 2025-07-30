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
        $maxMatches = 5; // Increase to give GPT-4o more context
    
        if (empty($question)) {
            return response()->json(['error' => 'Please provide a question!'], 400);
        }
    
        // Get embedding for the quEstion
        $embeddingResponse = Http::withToken(env('OPENAI_API_KEY'))
            ->post('https://api.openai.com/v1/embeddings', [
                'input' => $question,
                'model' => 'text-embedding-3-large',
            ]);
    
        if (!$embeddingResponse->successful()) {
            return response()->json(['error' => 'Failed to get embedding'], 500);
        }
    
        $questionEmbedding = $embeddingResponse->json()['data'][0]['embedding'];
    
        //pinecone for the top N matches
        $pineconeResponse = \App\Helpers\PineconeHelper::query($questionEmbedding, $maxMatches);
        $matches = $pineconeResponse['matches'] ?? [];
    
        //parking/penalty chunks
        $boosted = [];
        if (preg_match('/parking|penalt|fine|no\s+parking|illegal\s+parking/i', $question)) {
            foreach ($matches as $idx => $match) {
                $meta = $match['metadata'] ?? [];
                if (
                    !empty($meta['content']) && (
                    stripos($meta['content'], 'parking') !== false ||
                    stripos($meta['content'], 'penalty') !== false ||
                    stripos($meta['content'], 'fine') !== false)
                ) {
                    $matches[$idx]['score'] += 0.2; // Boost score
                    $boosted[] = $meta['title'] ?? $meta['section'] ?? '';
                }
            }
            // Sort matches again if boosting
            usort($matches, function($a, $b) {
                return ($b['score'] ?? 0) <=> ($a['score'] ?? 0);
            });
        }
    
        \Log::info('Pinecone matches', array_map(function($m) {
            $meta = $m['metadata'] ?? [];
            return [
                'score' => $m['score'] ?? null,
                'article' => $meta['article'] ?? '',
                'section' => $meta['section'] ?? '',
                'title' => $meta['title'] ?? '',
                'content_snippet' => mb_substr($meta['content'] ?? '', 0, 100),
            ];
        }, $matches));
    
        if (empty($matches)) {
            return response()->json(['answer' => "I’m sorry, but I couldn’t find anything relevant in my legal references. Please ask a Philippine legal question."]);
        }
    
        //article/section references
        $context = '';
        foreach ($matches as $match) {
            $meta = $match['metadata'] ?? [];
            $ref = '';
            if (!empty($meta['article'])) $ref .= $meta['article'];
            if (!empty($meta['section'])) $ref .= ' ' . $meta['section'];
            if (!empty($ref)) $ref = trim($ref) . ': ';
            $context .= $ref . ($meta['content'] ?? '') . "\n\n";
        }
    
        \Log::info('Built context', ['length' => strlen($context), 'context' => mb_substr($context, 0, 500)]);
    
        if (strlen($context) < 50) {
            return response()->json(['answer' => "I’m sorry, but I couldn’t find anything relevant in my legal references. Please ask a Philippine legal question."]);
        }
    
        // Compose the prompt for GPT-4o
        $prompt = <<<EOT
        You are a Philippine Legal AI Assistant.
        Answer using the following referenced sections from Parañaque City ordinances and traffic code.
        If the answer is not found, say so, or provide your best legal guess—but make clear when you do so.
        If possible, cite the Article and Section in your answer for clarity.
        Never invent information that is not in the context.
        If something is not stated, either say you don't know, or make a plausible assumption based on the given input, but make it clear.
        Do not say "provided text" or "the context." Respond confidently and concisely, staying within the bounds of the law.
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
                        'content' => 'You are a helpful Philippine legal assistant specializing in city ordinances and traffic codes.'
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
        
        //specific questions
        if (preg_match('/article\s+([ivx]+)/i', $question, $matches)) {
            $articleNum = strtoupper($matches[1]);
            return "ARTICLE $articleNum content and provisions";
        }
        
        //article mentions
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
