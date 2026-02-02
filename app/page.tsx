"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";

import AppShell from "@/components/ui/AppShell";
import UploadDropzone from "@/components/ui/UploadDropzone";
import PromptForm from "@/components/ui/PromptForm";
import ControlsPanel from "@/components/ui/ControlsPanel";

import { useThumbStore } from "@/store/useThumbStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const {
    file,
    originalImageUrl,
    prompt,
    settings,
    generatedImageUrl,
    loading,
    setFile,
    setPrompt,
    setSettings,
    setGeneratedImageUrl,
    setOriginalImageUrl,
    setLoading,
  } = useThumbStore();

  const [statusText, setStatusText] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const step = useMemo(() => {
    if (loading) return 4;
    if (generatedImageUrl) return 4;
    if (prompt && (file || originalImageUrl)) return 3;
    if (file || originalImageUrl) return 2;
    return 1;
  }, [file, originalImageUrl, prompt, generatedImageUrl, loading]);

  async function handleUpload() {
    if (!file) throw new Error("Please upload an image first.");
    const form = new FormData();
    form.append("file", file);

    const res = await axios.post("/api/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url as string;
  }

  async function handleGenerate() {
    try {
      setErrorText("");
      setStatusText("");
      setLoading(true);

      let imgUrl = originalImageUrl;

      if (!imgUrl) {
        setStatusText("Uploading image to Cloudinary...");
        imgUrl = await handleUpload();
        setOriginalImageUrl(imgUrl);
      }

      setStatusText("Generating with AI...");
      const genRes = await axios.post("/api/generate", {
        originalImageUrl: imgUrl,
        prompt,
        settings,
      });

      setGeneratedImageUrl(genRes.data.generatedImageUrl);
      setStatusText("Completed ✅");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Something went wrong";
      setErrorText(msg);
      setStatusText("");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = generatedImageUrl;
    a.download = "thumbnail.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleCopyLink() {
    if (!generatedImageUrl) return;
    await navigator.clipboard.writeText(generatedImageUrl);
    setStatusText("Copied link ✅");
    setTimeout(() => setStatusText(""), 1500);
  }

  return (
    <AppShell
      title="AI Thumbnail Studio"
      subtitle="Upload an image + prompt + presets → generate → keep history"
    >
      {/* Hero */}
      <div className="mb-6 rounded-3xl border bg-white/60 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                Demo
              </Badge>
              <Badge variant="outline" className="rounded-xl">
                AI UX
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Create thumbnails that look *clickable*.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Minimal workflow: upload → describe → generate. Clean history. Easy edits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border bg-background/70 px-3 py-2 text-xs dark:border-zinc-800">
              <div className="text-muted-foreground">Step</div>
              <div className="font-semibold">{step}/4</div>
            </div>
            <div className="w-40 overflow-hidden rounded-2xl border bg-background/70 p-2 dark:border-zinc-800">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-foreground transition-all"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {loading ? "Working..." : "Ready"}
              </p>
            </div>
          </div>
        </div>

        {errorText ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <div className="font-semibold">Generation failed</div>
            <div className="mt-1">{errorText}</div>
          </div>
        ) : null}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column: inputs */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>1) Upload</span>
                <Badge variant="outline" className="rounded-xl">
                  drag & drop
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadDropzone
                file={file}
                onFileSelected={(f) => {
                  setFile(f);
                  setOriginalImageUrl("");
                  setGeneratedImageUrl("");
                  setStatusText("");
                  setErrorText("");
                }}
              />

              <div className="rounded-2xl border bg-background/60 p-3 text-xs text-muted-foreground dark:border-zinc-800">
                Tip: Use a clean subject (face/object), strong contrast, and a short prompt.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>2) Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptForm prompt={prompt} onChange={setPrompt} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>3) Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ControlsPanel settings={settings} onChange={setSettings} />

              <Button
                className="w-full rounded-2xl"
                onClick={handleGenerate}
                disabled={loading || !prompt || (!file && !originalImageUrl)}
              >
                {loading ? "Generating..." : "Generate Thumbnail"}
              </Button>

              {statusText ? (
                <p className="text-sm text-muted-foreground">{statusText}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Right column: result */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>4) Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Original</p>
                {originalImageUrl ? (
                  <div className="relative aspect-video overflow-hidden rounded-2xl border">
                    <Image
                      src={originalImageUrl}
                      alt="Original"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
                    Upload an image to preview it here.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Generated</p>
                {generatedImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-2xl border">
                      <Image
                        src={generatedImageUrl}
                        alt="Generated thumbnail"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button className="rounded-2xl" onClick={handleDownload}>
                        Download
                      </Button>
                      <Button
                        className="rounded-2xl"
                        variant="outline"
                        onClick={handleCopyLink}
                      >
                        Copy Link
                      </Button>
                      <a
                        className="col-span-2"
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button className="w-full rounded-2xl" variant="secondary">
                          Open in new tab
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
                    Your generated thumbnail will appear here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-3xl border bg-white/50 p-4 text-sm text-muted-foreground shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/20">
            <div className="font-medium text-foreground">AI Prompt shortcut</div>
            <p className="mt-1 text-xs">
              Try: <span className="font-medium">“Bold title text, cinematic lighting, high contrast, clean background, clickbait style”</span>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
