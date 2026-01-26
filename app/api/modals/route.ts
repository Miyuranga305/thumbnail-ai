export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.NANO_BANANA_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 400 });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  return NextResponse.json(data);
}
