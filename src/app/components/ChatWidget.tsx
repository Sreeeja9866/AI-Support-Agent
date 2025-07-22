"use client";
import React, { useState, useRef, useEffect } from "react";

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Init speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsMicOn(false);
        sendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsMicOn(false);
      };
    }
  }, []);

  const sendMessage = async (msgText?: string) => {
    const message = msgText || input;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message })
    });

    const data = await res.json();
    const botMessage = { role: "assistant", text: data.answer || "Hmm, I didn't get that." };
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isMicOn) {
      recognitionRef.current.stop();
      setIsMicOn(false);
    } else {
      recognitionRef.current.start();
      setIsMicOn(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[360px] max-h-[85vh] bg-white rounded-xl shadow-xl p-4 border border-gray-300 z-[999] flex flex-col">
      <h2 className="text-lg font-bold mb-2">💬 Ava – Aven's AI Assistant</h2>

      {/* Chat bubbles */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-sm border-t pt-2 pb-4">

        {messages.map((msg, idx) => (
          <div key={idx} className={`text-left ${msg.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block px-3 py-2 rounded-xl max-w-[80%] ${
                msg.role === "user" ? "bg-[#12A594] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-xl max-w-[80%] bg-gray-100 text-gray-800 animate-pulse">
              Ava is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input + Mic */}
      {/* Input + Mic */}
<div className="mt-2 flex items-center gap-2">
  <input
    type="text"
    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
    placeholder="Ask Ava something..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />

  {input.trim() && (
    <button
      className="text-[#12A594] hover:text-[#0e7e71]"
      onClick={() => sendMessage()}
      title="Send"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  )}

  <button
    className={`text-white p-2 rounded-full ${isMicOn ? "bg-red-500" : "bg-blue-500"}`}
    onClick={toggleMic}
    title={isMicOn ? "Stop Mic" : "Speak"}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v8m0 4v4m0 4h.01M9 21h6a2 2 0 002-2v-2M7 17v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
    </svg>
  </button>
</div>

    </div>
  );
};

export default ChatWidget;
