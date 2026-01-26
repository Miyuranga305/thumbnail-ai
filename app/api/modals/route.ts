export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 400 });

  const genAI = new GoogleGenerativeAI(apiKey);

  // @ts-ignore - listModels exists in some SDK versions
  const models = await genAI.listModels();

  return NextResponse.json(models);
}
