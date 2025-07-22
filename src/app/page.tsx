"use client";

import { useEffect, useState } from "react";
import VapiWidget from "./components/VapiWidget";
import ChatWidget from "./components/ChatWidget";
import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID } from "@/constants/env";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Check if tokens exist (can be improved with cookies/session later)
  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleConnect = () => {
    window.location.href = "http://localhost:3000/api/google/auth";
  };

  const handleFollowUpSchedule = async () => {
    const tokens = JSON.parse(localStorage.getItem("google_tokens") || "{}");

    const response = await fetch("/api/google/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokens,
        summary: "Follow-up Meeting",
        startTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 5400 * 1000).toISOString(), // 1.5 hours from now
      }),
    });

    const result = await response.json();
    alert(result?.status || "Meeting scheduled!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 🎤 Voice Assistant Widget */}
        <VapiWidget apiKey={VAPI_PUBLIC_KEY} assistantId={VAPI_ASSISTANT_ID} />

        <div className="mt-8 flex flex-col items-center space-y-4">
          {isAuthenticated && (
            <button
              onClick={handleFollowUpSchedule}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
            >
              ⏰ Schedule Follow-Up Meeting
            </button>
          )}
        </div>
      </div>

      {/* 🟢 Chat Widget Appears on Bottom Right */}
      <ChatWidget />
    </div>
  );
}
