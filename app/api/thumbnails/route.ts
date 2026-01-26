import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Thumbnail } from "@/models/Thumbnail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const style = searchParams.get("style");
  const resolution = searchParams.get("resolution");

  await connectDB();

  const query: any = {};
  if (search) query.prompt = { $regex: search, $options: "i" };
  if (style) query["settings.stylePreset"] = style;
  if (resolution) query["settings.resolution"] = resolution;

  const list = await Thumbnail.find(query).sort({ createdAt: -1 }).limit(60);

  return NextResponse.json(list);
}
