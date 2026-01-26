"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PromptForm from "./PromptForm";
import ControlsPanel from "./ControlsPanel";

export default function EditModal({
  open,
  onOpenChange,
  initialPrompt,
  initialSettings,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPrompt: string;
  initialSettings: any;
  loading: boolean;
  onSubmit: (data: { prompt: string; settings: any }) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setPrompt(initialPrompt);
    setSettings(initialSettings);
  }, [initialPrompt, initialSettings, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prompt & Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PromptForm prompt={prompt} onChange={setPrompt} />
          <ControlsPanel settings={settings} onChange={(patch) => setSettings((s: any) => ({ ...s, ...patch }))} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onSubmit({ prompt, settings });
                onOpenChange(false);
              }}
              disabled={loading || !prompt}
            >
              {loading ? "Working..." : "Regenerate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
