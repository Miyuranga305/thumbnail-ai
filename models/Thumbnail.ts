import mongoose, { Schema, models, model } from "mongoose";

const ThumbnailSchema = new Schema(
  {
    originalImageUrl: { type: String, required: true },
    generatedImageUrl: { type: String, default: "" },
    prompt: { type: String, required: true },

    settings: {
      resolution: { type: String, default: "1024x1024" },
      stylePreset: { type: String, default: "realistic" },
      guidanceScale: { type: Number, default: 7 },
      steps: { type: Number, default: 30 },
      seed: { type: Number, default: null },
    },

    status: {
      type: String,
      enum: ["queued", "generating", "success", "failed"],
      default: "queued",
    },

    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Thumbnail = models.Thumbnail || model("Thumbnail", ThumbnailSchema);
