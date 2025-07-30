<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LegalChunk;
use Spatie\PdfToText\Pdf;
use Illuminate\Support\Facades\Http;

class UploadController extends Controller
{

    public function store(Request $request)
    {
        set_time_limit(300);
    
        \Log::info('Penalty table upload received', [
            'has_file' => $request->hasFile('file'),
            'file_size' => $request->file('file') ? $request->file('file')->getSize() : 'no file',
            'file_type' => $request->file('file') ? $request->file('file')->getMimeType() : 'no file'
        ]);
    
        if ($request->hasFile('file') && $request->file('file')->getSize() > 2 * 1024 * 1024) {
            \Log::error('File too large', ['size' => $request->file('file')->getSize()]);
            return response()->json(['error' => 'File size must be less than 2MB'], 400);
        }
    
        $request->validate([
            'file' => 'required|file|max:2048',
        ]);
    
        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
    
            $path = $file->store('uploads', 'local');
            $fullPath = storage_path('app/private/' . $path);
    
            \Log::info('File stored', ['path' => $path, 'full_path' => $fullPath]);
    
            if (!file_exists($fullPath)) {
                \Log::error('File does not exist after storage', ['full_path' => $fullPath]);
                return response()->json(['error' => 'File upload failed'], 500);
            }
    
            $text = file_get_contents($fullPath);
            unlink($fullPath);
    
            if (empty($text)) {
                \Log::error('No text extracted from file');
                return response()->json(['error' => 'No text could be extracted from the file'], 400);
            }
    
            //penaltite
            $lines = preg_split('/\r\n|\r|\n/', $text);
            $chunks = [];
            foreach ($lines as $line) {
                if (trim($line) === '') continue;
    
                //Section 41 - Parking and waiting in prohibited areas: ₱400.00
                if (preg_match('/^(Section|Article)\s*([A-Za-z0-9\(\)\/ ]+)\s*[\-:]?\s*(.+?)[:\-]\s*₱?([\d,\.]+.*)$/iu', $line, $m)) {
                    $chunks[] = [
                        'title' => trim($m[1] . ' ' . $m[2]),
                        'content' => trim($m[3]) . " Penalty: " . trim($m[4]),
                    ];
                } else {
                    
                    $chunks[] = [
                        'title' => '',
                        'content' => $line,
                    ];
                }
            }
    
            \Log::info('Penalty chunks created', [
                'total_chunks' => count($chunks),
                'sample_chunk' => $chunks[0] ?? []
            ]);
    
            $chunkCount = 0;
            $maxChunks = 100;
            $pineconeVectors = [];
    
            foreach ($chunks as $index => $chunk) {
                if ($chunkCount >= $maxChunks) break;
                if (strlen(trim($chunk['content'])) < 10) continue;
    
                try {
                    $embeddingResponse = Http::withToken(env('OPENAI_API_KEY'))
                        ->timeout(30)
                        ->post('https://api.openai.com/v1/embeddings', [
                            'input' => $chunk['content'],
                            'model' => 'text-embedding-3-large',
                        ]);
    
                    if (!$embeddingResponse->successful()) {
                        \Log::warning('Embedding failed for chunk', ['chunk_number' => $index + 1]);
                        continue;
                    }
    
                    $embedding = $embeddingResponse->json()['data'][0]['embedding'];
    
                    $savedChunk = \App\Models\LegalChunk::create([
                        'title' => $chunk['title'] ?: $originalName,
                        'content' => $chunk['content'],
                        'embedding' => $embedding,
                        'source' => $originalName,
                    ]);
    
                    $pineconeVectors[] = [
                        'id' => 'chunk-' . $savedChunk->id,
                        'values' => $embedding,
                        'metadata' => [
                            'title' => $chunk['title'] ?: $originalName,
                            'content' => substr($chunk['content'], 0, 500),
                            'source' => $originalName,
                        ],
                    ];
    
                    $chunkCount++;
                    usleep(100000); // avoid rate limits
    
                } catch (\Exception $e) {
                    \Log::error('Chunk processing failed: ' . $e->getMessage(), [
                        'chunk_number' => $index + 1
                    ]);
                    continue;
                }
            }
    
            if (!empty($pineconeVectors)) {
                \App\Helpers\PineconeHelper::upsert($pineconeVectors);
                \Log::info('Batch upserted to Pinecone', ['count' => count($pineconeVectors)]);
            } else {
                \Log::warning('No vectors to upsert to Pinecone.');
            }
    
            return response()->json([
                'message' => "Successfully processed $chunkCount penalty chunks from $originalName"
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Penalty upload failed: ' . $e->getMessage());
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }    
    

    private function extractPdfText($path)
    {
        //pang pdf lang
        try {
            $text = (new \Spatie\PdfToText\Pdf())
                ->setPdf($path)
                ->text();
            
            return $text;
        } catch (\Exception $e) {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($path);
            return $pdf->getText();
        }
    }

}
