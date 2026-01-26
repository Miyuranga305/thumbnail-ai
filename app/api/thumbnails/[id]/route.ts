import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Thumbnail } from "@/models/Thumbnail";
import { generateThumbnailWithNanoBanana } from "@/lib/aiProvider";

export async function GET(_: Request, { params }: any) {
  await connectDB();
  const doc = await Thumbnail.findById(params.id);
  return NextResponse.json(doc);
}

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();
  await connectDB();

  const doc = await Thumbnail.findById(params.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  doc.prompt = body.prompt ?? doc.prompt;
  doc.settings = body.settings ?? doc.settings;
  doc.status = "generating";
  await doc.save();

  try {
    const generatedImageUrl = await generateThumbnailWithNanoBanana({
      imageUrl: doc.originalImageUrl,
      prompt: doc.prompt,
      settings: doc.settings,
    });

    doc.generatedImageUrl = generatedImageUrl;
    doc.status = "success";
    await doc.save();

    return NextResponse.json(doc);
  } catch (err: any) {
    doc.status = "failed";
    doc.errorMessage = err?.message || "Regeneration failed";
    await doc.save();
    return NextResponse.json({ error: doc.errorMessage }, { status: 500 });
  }
}
