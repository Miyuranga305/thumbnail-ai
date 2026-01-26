// src/app/api/generate/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Thumbnail } from "@/models/Thumbnail";
import { generateThumbnailWithNanoBanana } from "@/lib/aiProvider";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const body = await req.json();
  const { originalImageUrl, prompt, settings } = body || {};

  if (!originalImageUrl || !prompt) {
    return NextResponse.json(
      { error: "Missing originalImageUrl or prompt" },
      { status: 400 }
    );
  }

  /* -------------------------------------------------
     Rate limiting (SAFE for Next 15/16)
  -------------------------------------------------- */
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  // 3 generates per minute per IP
  const rl = rateLimit(`gen:${ip}`, 3, 60_000);

  if (!rl.allowed) {
    const waitSec = Math.max(
      1,
      Math.ceil((rl.resetAt - Date.now()) / 1000)
    );

    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${waitSec}s.` },
      { status: 429 }
    );
  }

  /* -------------------------------------------------
     DB save (create record first)
  -------------------------------------------------- */
  await connectDB();

  const doc = await Thumbnail.create({
    originalImageUrl,
    prompt,
    settings,
    status: "generating",
  });

  try {
    const generatedImageUrl = await generateThumbnailWithNanoBanana({
      imageUrl: originalImageUrl,
      prompt,
      settings,
    });

    doc.generatedImageUrl = generatedImageUrl;
    doc.status = "success";
    doc.errorMessage = "";
    await doc.save();

    return NextResponse.json({
      thumbnailId: doc._id,
      generatedImageUrl,
      status: "success",
      remainingThisWindow: rl.remaining,
    });
  } catch (err: any) {
    const status = err?.status || err?.response?.status;
    const message =
      err?.message ||
      err?.response?.data?.error?.message ||
      "Generation failed";

    /* ---------------------------------------------
       DEMO FALLBACK if Gemini quota (429)
    ---------------------------------------------- */
    if (status === 429) {
      doc.generatedImageUrl = originalImageUrl;
      doc.status = "success";
      doc.errorMessage =
        "AI quota reached. Returned original image as demo fallback.";
      await doc.save();

      return NextResponse.json(
        {
          thumbnailId: doc._id,
          generatedImageUrl: doc.generatedImageUrl,
          status: "success",
          warning: doc.errorMessage,
        },
        { status: 200 }
      );
    }

    // Normal failure
    doc.status = "failed";
    doc.errorMessage = message;
    await doc.save();

    return NextResponse.json(
      { error: message, thumbnailId: doc._id },
      { status: 500 }
    );
  }
}
