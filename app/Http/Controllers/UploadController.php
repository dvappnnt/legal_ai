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
    
        \Log::info('Upload request received', [
            'has_file' => $request->hasFile('file'),
            'file_size' => $request->file('file') ? $request->file('file')->getSize() : 'no file',
            'file_type' => $request->file('file') ? $request->file('file')->getMimeType() : 'no file'
        ]);
    
        if ($request->hasFile('file') && $request->file('file')->getSize() > 2 * 1024 * 1024) {
            \Log::error('File too large', ['size' => $request->file('file')->getSize()]);
            return response()->json(['error' => 'File size must be less than 2MB'], 400);
        }
    
        $request->validate([
            'file' => 'required|file|mimes:txt,pdf|max:2048',
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
    
            if (strtolower($file->getClientOriginalExtension()) === 'pdf') {
                \Log::info('Extracting text from PDF');
                $text = $this->extractPdfText($fullPath);
            } else {
                \Log::info('Reading text file');
                $text = file_get_contents($fullPath);
            }
    
            \Log::info('Text extracted', ['text_length' => strlen($text)]);
            unlink($fullPath);
    
            if (empty($text)) {
                \Log::error('No text extracted from file');
                return response()->json(['error' => 'No text could be extracted from the file'], 400);
            }
    
            // ✅ SMART CHUNKING WITH TITLES
            $text = preg_replace('/\s+/', ' ', trim($text));
            $maxWords = 200;
            $words = preg_split('/\s+/', $text);
            $chunks = [];
            $currentChunk = [];
    
            foreach ($words as $word) {
                $currentChunk[] = $word;
    
                if (count($currentChunk) >= $maxWords) {
                    $chunks[] = implode(' ', $currentChunk);
                    $currentChunk = [];
                }
            }
    
            if (!empty($currentChunk)) {
                $chunks[] = implode(' ', $currentChunk);
            }
    
            \Log::info('Smart chunks created', [
                'total_chunks' => count($chunks),
                'sample_chunk' => substr($chunks[0] ?? '', 0, 100)
            ]);
    
            $chunkCount = 0;
            $maxChunks = 50;
            $pineconeVectors = [];
    
            foreach ($chunks as $index => $chunk) {
                if ($chunkCount >= $maxChunks) break;
                if (strlen(trim($chunk)) < 50) continue;
    
                try {
                    \Log::info('Processing chunk', [
                        'chunk_number' => $index + 1,
                        'chunk_length' => strlen($chunk)
                    ]);
    
                    // ✅ Extract title if found
                    $title = 'GENERAL';
                    if (preg_match('/ARTICLE\s+[A-Z0-9]+(\s+SECTION\s+\d+)?/i', $chunk, $m)) {
                        $title = trim($m[0]);
                    }
    
                    $embeddingResponse = Http::withToken(env('OPENAI_API_KEY'))
                        ->timeout(30)
                        ->post('https://api.openai.com/v1/embeddings', [
                            'input' => $chunk,
                            'model' => 'text-embedding-3-large',
                        ]);
    
                    if (!$embeddingResponse->successful()) {
                        \Log::warning('Embedding failed for chunk', ['chunk_number' => $index + 1]);
                        continue;
                    }
    
                    $embedding = $embeddingResponse->json()['data'][0]['embedding'];
    
                    $savedChunk = \App\Models\LegalChunk::create([
                        'content' => $chunk,
                        'embedding' => $embedding,
                        'source' => $originalName,
                    ]);
    
                    $pineconeVectors[] = [
                        'id' => 'chunk-' . $savedChunk->id,
                        'values' => $embedding,
                        'metadata' => [
                            'title' => $title,
                            'content' => substr($chunk, 0, 500),
                            'source' => $originalName,
                        ],
                    ];
    
                    $chunkCount++;
                    usleep(100000);
    
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
                'message' => "Successfully processed $chunkCount chunks from $originalName"
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Upload failed: ' . $e->getMessage());
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }
    


    private function extractPdfText($path)
    {
        try {
            // Use Spatie PDF-to-Text which is more reliable
            $text = (new \Spatie\PdfToText\Pdf())
                ->setPdf($path)
                ->text();
            
            return $text;
        } catch (\Exception $e) {
            // Fallback to smalot/pdfparser if Spatie fails
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($path);
            return $pdf->getText();
        }
    }

}
