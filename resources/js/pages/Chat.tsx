import { useState, ChangeEvent } from 'react';
import axios from 'axios';

export default function Chat() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [url, setUrl] = useState('');

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert('Uploaded!');
  };

  const scrape = async () => {
    if (!url) return;

    await axios.post('/api/scrape', { url });
    alert('Scraped!');
  };

  const ask = async () => {
    if (!question) return;

    const res = await axios.post('/api/ask', { question });
    setAnswer(res.data.answer);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">PH Legal AI — Test Page</h1>

      <div>
        <h2 className="font-semibold">Upload PDF/TXT</h2>
        <input type="file" onChange={handleFileChange} />
        <button
          className="bg-green-500 text-white px-4 py-2 mt-2"
          onClick={upload}
        >
          Upload
        </button>
      </div>

      <div>
        <h2 className="font-semibold mt-8">Scrape Website URL</h2>
        <input
          className="border p-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 mt-2"
          onClick={scrape}
        >
          Scrape
        </button>
      </div>

      <div>
        <h2 className="font-semibold mt-8">Ask a Question</h2>
        <input
          className="border p-2 w-full"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What does Article 3 say?"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-2"
          onClick={ask}
        >
          Ask
        </button>
        {answer && (
          <p className="mt-4 p-4 border rounded bg-gray-50">
            <strong>Answer:</strong> {answer}
          </p>
        )}
      </div>
    </div>
  );
}
