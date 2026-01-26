"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditModal from "@/components/ui/EditModal";

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
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Thumbnail Details</h1>
            <p className="text-sm text-muted-foreground">
              Status: {item.status} {statusText ? `• ${statusText}` : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/history">
              <Button variant="outline">Back</Button>
            </Link>
            <Button onClick={() => setEditOpen(true)} disabled={loading}>
              Edit / Regenerate
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{item.prompt}</p>

            {item.status === "failed" && item.errorMessage ? (
              <p className="mt-2 text-sm text-red-600">{item.errorMessage}</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Original</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                <Image
                  src={item.originalImageUrl}
                  alt="Original"
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Generated</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.generatedImageUrl ? (
                <>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                    <Image
                      src={item.generatedImageUrl}
                      alt="Generated thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={download}>Download</Button>
                    <a
                      href={item.generatedImageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="secondary">Open</Button>
                    </a>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border p-6 text-sm text-muted-foreground">
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
      </div>
    </main>
  );
}
