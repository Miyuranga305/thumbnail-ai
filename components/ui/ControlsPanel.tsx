"use client";

import { Input } from "@/components/ui/input";
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Resolution</p>
        <select
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          value={settings.resolution}
          onChange={(e) => onChange({ resolution: e.target.value })}
        >
          <option value="512x512">512x512</option>
          <option value="1024x1024">1024x1024</option>
          <option value="1920x1080">1920x1080</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Style Preset</p>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ stylePreset: s })}
            >
              <Badge
                variant={settings.stylePreset === s ? "default" : "secondary"}
                className="rounded-xl px-3 py-1"
              >
                {s}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">Guidance</p>
          <Input
            type="number"
            value={settings.guidanceScale}
            onChange={(e) => onChange({ guidanceScale: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Steps</p>
          <Input
            type="number"
            value={settings.steps}
            onChange={(e) => onChange({ steps: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Seed</p>
          <Input
            type="number"
            value={settings.seed ?? ""}
            placeholder="optional"
            onChange={(e) =>
              onChange({
                seed: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
