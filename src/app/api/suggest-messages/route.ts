// api/generate-questions/route.ts (Edge runtime)
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

const model = google("gemini-1.5-flash"); // adapter for Vercel AI SDK

export async function POST(req: Request) {
  try {
    // If you plan to accept prompts from the frontend, parse req.json() here.
    // const { prompt } = await req.json();
    // For now we'll use your fixed prompt:
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // streamText expects a model adapter from @ai-sdk/*
    const { textStream } = await streamText({
      model, // <-- this must be the adapter returned by google(...)
      prompt,
      // optional: maxTokens, temperature, streamProtocol: "text" | "json", etc.
    });

    // Return the ReadableStream directly as an HTTP response
    // Edge runtime can return a native Response
    return new Response(textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Streaming error:", err);
    return new Response(
      JSON.stringify({ message: err?.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
