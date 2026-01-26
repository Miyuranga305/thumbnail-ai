// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThumbStore } from "@/store/useThumbStore";
import ControlsPanel from "@/components/ui/ControlsPanel";
import PromptForm from "@/components/ui/PromptForm";
import UploadDropzone from "@/components/ui/UploadDropzone";

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
      setStatusText("");
      setLoading(true);

      let imgUrl = originalImageUrl;

      // Upload if we don't have originalImageUrl yet
      if (!imgUrl) {
        setStatusText("Uploading image...");
        imgUrl = await handleUpload();
        setOriginalImageUrl(imgUrl);
      }

      setStatusText("Generating thumbnail...");
      const genRes = await axios.post("/api/generate", {
        originalImageUrl: imgUrl,
        prompt,
        settings,
      });

      setGeneratedImageUrl(genRes.data.generatedImageUrl);
      setStatusText("Done ✅");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Something went wrong";
      setStatusText(`Error: ${msg}`);
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
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">AI Thumbnail Generator (Demo)</h1>
            <p className="text-sm text-muted-foreground">
              Upload an image + prompt + settings → generate → save to history.
            </p>
          </div>

          <Link href="/history">
            <Button variant="outline">View History</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>1) Upload + Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadDropzone
                file={file}
                onFileSelected={(f) => {
                  setFile(f);
                  setOriginalImageUrl(""); // reset if new image
                  setGeneratedImageUrl("");
                }}
              />

              <PromptForm prompt={prompt} onChange={setPrompt} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>2) Settings + Generate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ControlsPanel settings={settings} onChange={setSettings} />

              <Button
                className="w-full"
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

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Original</p>
                {originalImageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                    <Image
                      src={originalImageUrl}
                      alt="Original"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                    No image uploaded yet.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Generated</p>
                {generatedImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                      <Image
                        src={generatedImageUrl}
                        alt="Generated thumbnail"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleDownload}>Download</Button>
                      <Button variant="outline" onClick={handleCopyLink}>
                        Copy Link
                      </Button>
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="secondary">Open</Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                    Generate a thumbnail to see result here.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
