import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));

    const finalPrompt =
      prompt ||
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    // "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform.";

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        "What's your favorite movie?||Do you have any pets?||What's your dream job?",
        {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          status: 200,
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
    return result.toUIMessageStreamResponse(); // max token option per user
    // what is sdk format for stream response
  } catch (err) {
    console.error("Error in /api/suggest-messages:", err);
    return new Response(
      "What's your favorite movie?||Do you have any pets?||What's your dream job?",
      {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        status: 200,
      }
    );
  }
  
}
