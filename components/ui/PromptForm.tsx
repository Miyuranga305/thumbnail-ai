"use client";

import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PromptForm({
  prompt,
  onChange,
}: {
  prompt: string;
  onChange: (v: string) => void;
}) {
  const maxChars = 600;

  const remaining = useMemo(() => maxChars - (prompt?.length || 0), [prompt]);

  const suggestions = [
    "bold title text",
    "high contrast",
    "cinematic lighting",
    "clean background",
    "YouTube style",
    "sharp focus",
    "vibrant colors",
    "minimal typography",
  ];

  function addChip(text: string) {
    const p = (prompt || "").trim();
    const next =
      p.length === 0 ? text : p.endsWith(",") ? `${p} ${text}` : `${p}, ${text}`;
    onChange(next);
  }

  function clearPrompt() {
    onChange("");
  }

  function applyTemplate() {
    // Simple structured prompt format (no external AI)
    const template =
      "Subject: [what is in the thumbnail]\n" +
      "Style: [realistic | artistic | cartoon | minimalist]\n" +
      "Text: [short title text]\n" +
      "Colors: [main colors]\n" +
      "Composition: [centered subject, big face, etc.]\n" +
      "Mood: [energetic, dramatic, clean]\n";
    onChange(template);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Prompt</p>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${
              remaining < 0 ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {prompt.length}/{maxChars}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-xl"
            onClick={clearPrompt}
            disabled={!prompt}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Prompt Box */}
      <div className="rounded-2xl border bg-background/60 p-2 shadow-sm">
        <Textarea
          placeholder="Example: Big bold title text, high contrast, cinematic lighting, clean background, YouTube style..."
          value={prompt}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars + 200))}
          className="min-h-[140px] resize-none border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => addChip(s)}
            className="rounded-full"
          >
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              + {s}
            </Badge>
          </button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full"
          onClick={applyTemplate}
        >
          Use template
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: describe <span className="font-medium">subject</span>,{" "}
        <span className="font-medium">style</span>,{" "}
        <span className="font-medium">text</span>, and{" "}
        <span className="font-medium">mood</span>.
      </p>
    </div>
  );
}
