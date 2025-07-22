'use client';

import { useEffect, useState, useRef } from 'react';
import VapiWidget from "../components/VapiWidget";
import ChatClient from "../components/ChatClient"; 
import ChatWidget from "../components/ChatWidget";
import { env } from "@/config/env";

// Type declaration for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const recognitionRef = useRef<any>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
    }
  }, []);

  const speak = (text: string) => {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.cancel();
    synth.speak(utterance);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const { answer } = await res.json();
    setMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    speak(answer);
  };

  const handleVoiceInput = () => {
    recognitionRef.current?.start();
    recognitionRef.current!.onresult = (e: any) => {
      const speechText = e.results[0][0].transcript;
      sendMessage(speechText);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">

        {/* Voice Assistant Widget (Floating button) */}
        <VapiWidget apiKey={env.VAPI_PUBLIC_KEY} assistantId={env.VAPI_ASSISTANT_ID} />

        {/* Chat Client Placeholder (if needed) */}
        <ChatClient />

        {/* Voice Input Text UI */}
        <div className="bg-white p-4 rounded shadow">
          <h1 className="text-xl font-bold mb-4">🎙️ Ava — AI Voice & Chat Assistant</h1>

          <div className="h-64 overflow-y-auto border p-2 mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <p className={`mb-2 ${msg.role === 'user' ? 'text-blue-600' : 'text-green-700'}`}>{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(input);
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Send
            </button>
            <button
              onClick={handleVoiceInput}
              className="bg-purple-600 text-white px-4 py-1 rounded"
            >
              🎤 Speak
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
