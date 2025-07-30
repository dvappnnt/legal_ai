import React, { useState, useRef, useEffect } from 'react';

export default function LegalAiChat() {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingDots, setTypingDots] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      setTypingDots('');
      return;
    }
    let dots = '';
    const interval = setInterval(() => {
      dots = dots.length < 3 ? dots + '•' : '';
      setTypingDots(dots);
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const typeMessage = async (fullText: string) => {
    let index = 0;
    const typingSpeed = 20; // ms per char
  
    return new Promise<void>((resolve) => {
      const typeNext = () => {
        index++;
  
        setMessages((prev) => {
          if (prev.length === 0) return prev;
  
          const last = prev[prev.length - 1];
          const newText = fullText.slice(0, index);
  
          return [...prev.slice(0, -1), { sender: 'ai', text: newText }];
        });
  
        if (index < fullText.length) {
          setTimeout(typeNext, typingSpeed);
        } else {
          resolve();
        }
      };
  
      // Start typing only if text is not empty
      if (fullText.length > 0) {
        typeNext();
      } else {
        resolve();
      }
    });
  };
  

  const handleAsk = async () => {

    setQuestion('');
    if (!question.trim()) {
      alert('Please type your question.');
      return;
    }

    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setLoading(true);

    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : '';

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      const aiAnswer = data.answer || 'Sorry, no answer found.';

      setMessages((prev) => [...prev, { sender: 'ai', text: '' }]);

      await typeMessage(aiAnswer);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred.';
      setMessages((prev) => [...prev, { sender: 'ai', text: '' }]);
      await typeMessage(errorMsg);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const handleClear = () => {
    setMessages([]);
    setQuestion('');
  };

  const handleCopy = () => {
    const aiMessages = messages.filter((m) => m.sender === 'ai').map((m) => m.text).join('\n\n');
    navigator.clipboard.writeText(aiMessages).then(() => {
      alert('AI answer(s) copied!');
    });
  };

  return (
    <div className="flex items-center justify-center bg-gray-100" style={{height: '93vh'}}>
      <div className="flex flex-col bg-white w-full max-w-2xl h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'ml-auto bg-[#F0F8FF] text-[#10214B]'
                  : 'mr-auto bg-gray-200 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
            <div className="w-1/4 p-3 rounded-lg mr-auto bg-gray-200 text-gray-800 italic opacity-70">
              {`•${typingDots}`}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex bg-[#f0f0f0] rounded-b">
          <input
            className="w-full p-3 text-black"
            placeholder="Ask your legal question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-[#7C7AE1] text-white px-4 py-4 my-auto rounded hover:bg-[#D0c3ba] disabled:opacity-50 self-end hover:text-[#10214B]"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
