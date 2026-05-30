import { NextRequest, NextResponse } from "next/server";
import { PortfolioData } from "@/lib/types";
import { Redis } from "@upstash/redis";

const PORTFOLIO_KEY = "portfolio-data";

// Initialize Redis client - will work when env vars are set on Vercel
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export async function GET() {
  // Try Redis first
  if (isRedisConfigured) {
    try {
      const data = await redis.get<PortfolioData>(PORTFOLIO_KEY);
      if (data) {
        return NextResponse.json({ source: "cloud", data });
      }
    } catch (e) {
      console.error("Redis read error:", e);
    }
  }

  // Fallback to empty response (will use localStorage)
  return NextResponse.json({ source: "local", data: null });
}

export async function POST(request: NextRequest) {
  try {
    const data: PortfolioData = await request.json();

    // Save to Redis if configured
    if (isRedisConfigured) {
      await redis.set(PORTFOLIO_KEY, JSON.stringify(data));
      return NextResponse.json({ success: true, source: "cloud" });
    }

    // Fallback: return success anyway (localStorage handles it)
    return NextResponse.json({
      success: true,
      source: "local",
      message: "Redis not configured, data saved locally only",
    });
  } catch (e) {
    console.error("Save error:", e);
    return NextResponse.json(
      { error: "Failed to save data", details: String(e) },
      { status: 500 }
    );
  }
}
