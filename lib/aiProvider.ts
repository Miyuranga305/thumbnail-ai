import { GoogleGenAI } from "@google/genai";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickAspectRatio(resolution: string) {
  if (resolution === "1920x1080") return "16:9";
  return "1:1";
}

async function callGeminiWithRetry(ai: GoogleGenAI, payload: any) {
  const maxAttempts = 4; // total tries
  let lastErr: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(payload);
    } catch (err: any) {
      lastErr = err;

      const status = err?.status || err?.response?.status;
      const retryDelaySec =
        // Google sometimes returns retryDelay like "51s" in error details
        parseRetryDelaySeconds(err) ??
        // fallback exponential backoff: 2s, 4s, 8s...
        Math.min(2 ** attempt, 20);

      // Retry only for 429 / 503
      if (status === 429 || status === 503) {
        // Wait then retry
        await sleep(retryDelaySec * 1000);
        continue;
      }

      // Other errors: throw immediately
      throw err;
    }
  }

  throw lastErr;
}

function parseRetryDelaySeconds(err: any): number | null {
  try {
    const details = err?.errorDetails || err?.response?.data?.error?.details;
    if (!details) return null;

    // Find something like: {"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"51s"}
    const retryInfo = Array.isArray(details)
      ? details.find((d: any) => d?.retryDelay)
      : null;

    const delayStr = retryInfo?.retryDelay as string | undefined;
    if (!delayStr) return null;

    // "51s" -> 51
    const match = delayStr.match(/^(\d+)s$/);
    if (!match) return null;
    return Number(match[1]);
  } catch {
    return null;
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

async function uploadBase64ToCloudinary(base64: string): Promise<string> {
  const cloudinary = (await import("cloudinary")).v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    { folder: "thumbnail-ai/generated" }
  );

  return result.secure_url;
}

export async function generateThumbnailWithNanoBanana({
  imageUrl,
  prompt,
  settings,
}: {
  imageUrl: string;
  prompt: string;
  settings: any;
}) {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) throw new Error("NANO_BANANA_API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });
  const aspectRatio = pickAspectRatio(settings.resolution);
  const base64 = await fetchImageAsBase64(imageUrl);

  const payload = {
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          { text: `Style: ${settings.stylePreset}\nPrompt: ${prompt}` },
          { inlineData: { mimeType: "image/jpeg", data: base64 } },
        ],
      },
    ],
    config: {
      imageConfig: { aspectRatio },
    },
  };

  const response = await callGeminiWithRetry(ai, payload);

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image returned from Nano Banana model");
  }

  return await uploadBase64ToCloudinary(imagePart.inlineData.data);
}
