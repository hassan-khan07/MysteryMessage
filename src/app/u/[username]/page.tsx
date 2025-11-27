"use client";
import React from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";

const specialChar = "||";

const parseStringMessages = (messages: string) => {
  if (!messages) return [];
  return messages.split(specialChar).map((m) => m.trim());
};

export default function SendMessage() {
  const {
    complete,
    completion,
    isLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
  });

  const fetchSuggestedMessages = async () => {
    console.log("🚀 Calling complete()...");
    await complete(""); // Empty string to use default prompt
  };

  console.log("🔥 completion updated:", completion);
  console.log("⚠️ error:", error);
  console.log("⏳ isLoading:", isLoading);

  const messages = parseStringMessages(completion);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Suggested Messages</h2>
      
      <Button onClick={fetchSuggestedMessages} disabled={isLoading}>
        {isLoading ? "Generating..." : "Suggest Messages"}
      </Button>

      <div className="mt-6 space-y-3">
        {error && (
          <p className="text-red-500">❌ Error: {error.message}</p>
        )}
        
        {!completion && !isLoading && (
          <p className="text-gray-500">Click the button to generate messages.</p>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className="p-3 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}