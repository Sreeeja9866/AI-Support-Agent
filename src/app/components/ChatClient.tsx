'use client';

import { useState } from 'react';

export default function ChatClient() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || '⚠️ No answer returned.');
    } catch (err) {
      console.error(err);
      setAnswer('❌ Error occurred.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6 space-y-4">
      <textarea
        className="w-full p-2 border rounded text-black"
        rows={3}
        placeholder="Ask your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Asking...' : 'Ask'}
      </button>

      {answer && (
        <div className="p-3 border-t text-black">
          <strong>Answer:</strong>
          <p className="mt-2 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
