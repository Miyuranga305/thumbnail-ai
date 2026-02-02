"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Settings = {
  resolution: string;
  stylePreset: string;
  guidanceScale: number;
  steps: number;
  seed: number | null;
};

export default function ControlsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const styles = ["realistic", "artistic", "cartoon", "minimalist"] as const;

  const resolutions = useMemo(
    () => [
      { key: "512x512", label: "Square", hint: "Fast • Social posts" },
      { key: "1024x1024", label: "HD Square", hint: "Balanced • Default" },
      { key: "1920x1080", label: "YouTube", hint: "Wide • Thumbnail" },
    ],
    []
  );

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function randomizeSeed() {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    onChange({ seed });
  }

  return (
    <div className="space-y-5">
      {/* Resolution cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Resolution</p>
          <Badge variant="secondary" className="rounded-xl">
            {settings.resolution}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {resolutions.map((r) => {
            const active = settings.resolution === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => onChange({ resolution: r.key })}
                className={[
                  "rounded-2xl border p-3 text-left transition cursor-pointer",
                  "bg-background/60 hover:bg-background",
                  "shadow-sm",
                  active
                    ? "border-foreground/30 ring-2 ring-foreground/10"
                    : "border-border",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{r.label}</p>
                  {active ? (
                    <Badge className="rounded-full px-2 py-0.5">Selected</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full px-2 py-0.5">
                      Pick
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style presets */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Style Preset</p>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => {
            const active = settings.stylePreset === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ stylePreset: s })}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition cursor-pointer",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background/60 text-foreground border-border hover:bg-background",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders + number inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Guidance */}
        <div className="rounded-2xl border bg-background/60 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Guidance</p>
            <Badge variant="secondary" className="rounded-xl">
              {settings.guidanceScale}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Higher = closer to prompt, lower = more creative.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={20}
              value={settings.guidanceScale}
              onChange={(e) =>
                onChange({ guidanceScale: Number(e.target.value) })
              }
              className="w-full"
            />
            <Input
              className="w-20"
              type="number"
              min={1}
              max={20}
              value={settings.guidanceScale}
              onChange={(e) =>
                onChange({
                  guidanceScale: clamp(Number(e.target.value), 1, 20),
                })
              }
            />
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl border bg-background/60 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Steps</p>
            <Badge variant="secondary" className="rounded-xl">
              {settings.steps}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            More steps = better quality but slower.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={80}
              value={settings.steps}
              onChange={(e) => onChange({ steps: Number(e.target.value) })}
              className="w-full"
            />
            <Input
              className="w-20"
              type="number"
              min={10}
              max={80}
              value={settings.steps}
              onChange={(e) =>
                onChange({ steps: clamp(Number(e.target.value), 10, 80) })
              }
            />
          </div>
        </div>
      </div>

      {/* Seed */}
      <div className="rounded-2xl border bg-background/60 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Seed (optional)</p>
            <p className="text-xs text-muted-foreground">
              Same seed + same prompt/settings = similar output.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={randomizeSeed}
          >
            Randomize
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            value={settings.seed ?? ""}
            placeholder="Leave empty for random"
            onChange={(e) =>
              onChange({
                seed: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onChange({ seed: null })}
            disabled={settings.seed === null}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
