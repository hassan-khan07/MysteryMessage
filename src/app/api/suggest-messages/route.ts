// import { google } from "@ai-sdk/google";
// import { streamText } from "ai";

// export const runtime = "edge";

// export async function POST(req: Request) {
//   try {
//     const { prompt } = await req.json().catch(() => ({}));
    
//     const finalPrompt =
//       prompt ||
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
//       return new Response(
//         "What's your favorite movie?||Do you have any pets?||What's your dream job?",
//         {
//           headers: { "Content-Type": "text/plain; charset=utf-8" },
//           status: 200,
//         }
//       );
//     }

//     // ✅ CHANGED: Removed the second parameter - API key is read from environment variable
//     // The google provider automatically uses GOOGLE_GENERATIVE_AI_API_KEY env variable
//     const model = google("models/gemini-2.5-flash");

//     const result = await streamText({
//       model,
//       prompt: finalPrompt,
//     });

    // return result.toUIMessageStreamResponse();
    
//   } catch (err) {
//     console.error("Error in /api/suggest-messages:", err);
//     return new Response(
//       "What's your favorite movie?||Do you have any pets?||What's your dream job?",
//       {
//         headers: { "Content-Type": "text/plain; charset=utf-8" },
//         status: 200,
//       }
//     );
//   }
// }



import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { Redis } from "@upstash/redis";
import { ApiResponse } from "@/types/ApiResponse";

export const runtime = "edge";

// ✅ Initialize Redis with the environment variables Vercel created
const redis = new Redis({
  url: process.env.UPSTASH__KV_REST_API_URL!,
  token: process.env.UPSTASH__KV_REST_API_TOKEN!,
});

// Configuration
const RATE_LIMIT = {
  maxRequests: 1,
  windowMinutes: 15,
};

/**
 * Get identifier for rate limiting
 * Prioritizes user ID if authenticated, falls back to IP
 */
function getRateLimitKey(req: Request, userId?: string): string {
  if (userId) return `ratelimit:user:${userId}`;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  return `ratelimit:ip:${ip}`;
}

/**
 * Check if request is within rate limit
 */
async function checkRateLimit(key: string) {
  try {
    const current = await redis.get<number>(key);
    const windowSeconds = RATE_LIMIT.windowMinutes * 60;

    if (current === null) {
      // First request
      await redis.set(key, 1, { ex: windowSeconds });
      return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
    }

    if (current >= RATE_LIMIT.maxRequests) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);
      const resetAt = Date.now() + (ttl ?? 0) * 1000;
      return { allowed: false, remaining: 0, resetAt };
    }

    // Increment request count
    await redis.incr(key);
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - current };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    // Fail-open: allow requests if Redis fails
    return { allowed: true, remaining: RATE_LIMIT.maxRequests };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, userId } = body;

    // Rate-limit
    const rateLimitKey = getRateLimitKey(req, userId);
    const { allowed, remaining, resetAt } = await checkRateLimit(rateLimitKey);

    if (!allowed && resetAt) {
      const minutesLeft = Math.ceil((resetAt - Date.now()) / 60000);
      const response: ApiResponse = {
        success: false,
        message: `Rate limit exceeded. Please wait ${minutesLeft} minute${
          minutesLeft !== 1 ? "s" : ""
        } before requesting new suggestions. 🎯`,
      };

      return Response.json(response, {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(resetAt).toISOString(),
        },
      });
    }

    // Construct prompt
    const finalPrompt =
      prompt ||
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform. Avoid sensitive topics and focus on universal themes that encourage friendly interaction.";

    // Fallback if no API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const response: ApiResponse = {
        success: true,
        message:
          "What's your favorite movie?||Do you have any pets?||What's your dream job?",
      };
      return Response.json(response, {
        status: 200,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      });
    }

    // Generate AI suggestions with streaming
    const model = google("models/gemini-2.5-flash");
    const result = await streamText({
      model,
      prompt: finalPrompt,
    });

    const stream = result.toUIMessageStreamResponse();

    return new Response(stream.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(stream.headers.entries()),
        "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-Stream-Response": "true",
      },
    });
  } catch (err) {
    console.error("Error in /api/suggest-messages:", err);
    const response: ApiResponse = {
      success: false,
      message: "Failed to generate suggestions. Please try again later.",
    };
    return Response.json(response, { status: 500 });
  }
}