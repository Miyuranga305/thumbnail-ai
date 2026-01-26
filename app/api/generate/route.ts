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
    console.error("🔥 GENERATE ERROR:", err);
    const msg =
        err?.response?.data?.error ||
        err?.message ||
        JSON.stringify(err, null, 2) ||
        "Generation failed";

    doc.status = "failed";
    doc.errorMessage = msg;
    await doc.save();

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
