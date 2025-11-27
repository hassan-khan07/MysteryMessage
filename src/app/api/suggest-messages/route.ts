import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));
    
    const finalPrompt =
      prompt ||
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform.";

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        "What's your favorite movie?||Do you have any pets?||What's your dream job?",
        { 
          headers: { "Content-Type": "text/plain; charset=utf-8" }, 
          status: 200 
        }
      );
    }

    const model = google("models/gemini-2.0-flash-lite-preview", {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const result = await streamText({
      model,
      prompt: finalPrompt,
    });

    // This is the correct method for useCompletion
    return result.toUIMessageStreamResponse();// max token option per user
    // what is sdk format for stream response
    
  } catch (err: any) {
    console.error("Error in /api/suggest-messages:", err);
    return new Response(
      "What's your favorite movie?||Do you have any pets?||What's your dream job?",
      { 
        headers: { "Content-Type": "text/plain; charset=utf-8" }, 
        status: 200 
      }
    );
  }
}