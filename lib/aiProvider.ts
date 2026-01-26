import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NANO_BANANA_API_KEY;

if (!apiKey) {
  throw new Error("NANO_BANANA_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Image-to-image thumbnail generation
 * (Nano Banana / Gemini image model)
 */
export async function generateThumbnailWithNanoBanana({
  imageUrl,
  prompt,
  settings,
}: {
  imageUrl: string;
  prompt: string;
  settings: {
    resolution: string;
    stylePreset: string;
    guidanceScale: number;
    steps: number;
    seed: number | null;
  };
}) {
  // Nano Banana image model
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash-image-preview",
  });

  const fullPrompt = `
Style: ${settings.stylePreset}
Resolution: ${settings.resolution}
Guidance: ${settings.guidanceScale}
Steps: ${settings.steps}

User prompt:
${prompt}
`;

//   const result = await model.generateContent([
//     {
//       role: "user",
//       parts: [
//         { text: fullPrompt },
//         {
//           inlineData: {
//             mimeType: "image/jpeg",
//             data: await fetchImageAsBase64(imageUrl),
//           },
//         },
//       ],
//     },
//   ]);
const result = await model.generateContent([
  { text: fullPrompt },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: await fetchImageAsBase64(imageUrl),
    },
  },
]);

  const response = result.response;

  // Gemini returns image as base64
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image returned from Nano Banana API");
  }

  const base64Image = imagePart.inlineData.data;

  // Convert base64 → Cloudinary upload
  const uploadedUrl = await uploadBase64ToCloudinary(base64Image);

  return uploadedUrl;
}

/* ================== HELPERS ================== */

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
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
