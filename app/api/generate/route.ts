import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Thumbnail } from "@/models/Thumbnail";
import { generateThumbnailWithNanoBanana } from "@/lib/aiProvider";

export async function POST(req: Request) {
  const body = await req.json();
  const { originalImageUrl, prompt, settings } = body;

  if (!originalImageUrl || !prompt) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

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
    await doc.save();

    return NextResponse.json({
      thumbnailId: doc._id,
      generatedImageUrl,
      status: "success",
    });
  } catch (err: any) {
    doc.status = "failed";
    doc.errorMessage = err?.message || "Generation failed";
    await doc.save();

    return NextResponse.json({ error: doc.errorMessage }, { status: 500 });
  }
}
