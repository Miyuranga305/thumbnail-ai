"use client";

import { Textarea } from "@/components/ui/textarea";

export default function PromptForm({
  prompt,
  onChange,
}: {
  prompt: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Prompt</p>
      <Textarea
        placeholder="Example: Create a YouTube thumbnail with bold text, high contrast, cinematic lighting..."
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] rounded-xl"
      />
      <p className="text-xs text-muted-foreground">
        Tip: mention style, colors, text, mood, and composition.
      </p>
    </div>
  );
}
