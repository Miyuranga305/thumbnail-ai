"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

import AppShell from "@/components/ui/AppShell";
import EditModal from "@/components/ui/EditModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Thumb = {
  _id: string;
  prompt: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  status: string;
  errorMessage?: string;
  settings: {
    resolution: string;
    stylePreset: string;
    guidanceScale: number;
    steps: number;
    seed: number | null;
  };
  createdAt: string;
  updatedAt: string;
};

export default function ThumbDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Thumb | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusText, setStatusText] = useState("");

  async function fetchOne() {
    const res = await axios.get(`/api/thumbnails/${params.id}`);
    setItem(res.data);
  }

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regenerate(updated: { prompt: string; settings: any }) {
    setLoading(true);
    setStatusText("Regenerating...");
    try {
      const res = await axios.patch(`/api/thumbnails/${params.id}`, updated);
      setItem(res.data);
      setStatusText("Done ✅");
    } catch (err: any) {
      setStatusText(err?.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusText(""), 1500);
    }
  }

  function download() {
    if (!item?.generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = item.generatedImageUrl;
    a.download = "thumbnail.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!item) {
    return (
      <AppShell title="Thumbnail" subtitle="Loading...">
        <div className="rounded-3xl border p-6 text-sm text-muted-foreground">
          Loading...
        </div>
      </AppShell>
    );
  }

  const statusVariant =
    item.status === "success"
      ? "secondary"
      : item.status === "failed"
      ? "destructive"
      : "outline";

  return (
    <AppShell
      title="Thumbnail Details"
      subtitle="View, download, or regenerate with new prompt/presets"
      right={
        <Link href="/history" className="hidden sm:block">
          <Button size="sm" variant="outline">
            Back
          </Button>
        </Link>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Thumbnail Details</h1>
          <Badge variant={statusVariant as any} className="rounded-xl">
            {item.status}
          </Badge>
          {statusText ? (
            <Badge variant="outline" className="rounded-xl">
              {statusText}
            </Badge>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Link href="/history" className="sm:hidden">
            <Button variant="outline" className="rounded-2xl">
              Back
            </Button>
          </Link>
          <Button
            className="rounded-2xl"
            onClick={() => setEditOpen(true)}
            disabled={loading}
          >
            Edit / Regenerate
          </Button>
        </div>
      </div>

      {item.status === "failed" && item.errorMessage ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="font-semibold">Generation failed</div>
          <div className="mt-1">{item.errorMessage}</div>
        </div>
      ) : null}

      <Card className="mb-6 rounded-3xl">
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{item.prompt}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {item.settings.stylePreset} • {item.settings.resolution} • steps{" "}
            {item.settings.steps} • guidance {item.settings.guidanceScale}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border">
              <Image
                src={item.originalImageUrl}
                alt="Original"
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.generatedImageUrl ? (
              <>
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border">
                  <Image
                    src={item.generatedImageUrl}
                    alt="Generated thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="rounded-2xl" onClick={download}>
                    Download
                  </Button>
                  <a href={item.generatedImageUrl} target="_blank" rel="noreferrer">
                    <Button className="w-full rounded-2xl" variant="secondary">
                      Open
                    </Button>
                  </a>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
                No generated image yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialPrompt={item.prompt}
        initialSettings={item.settings}
        loading={loading}
        onSubmit={regenerate}
      />
    </AppShell>
  );
}
