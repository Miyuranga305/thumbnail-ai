"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";

export default function UploadDropzone({
  file,
  onFileSelected,
}: {
  file: File | null;
  onFileSelected: (file: File) => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const f = acceptedFiles?.[0];
      if (f) onFileSelected(f);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <Card className="rounded-2xl border p-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border border-dashed p-6 text-center text-sm ${
          isDragActive ? "bg-muted" : ""
        }`}
      >
        <input {...getInputProps()} />

        {file ? (
          <div>
            <p className="font-medium">Selected:</p>
            <p className="text-muted-foreground">{file.name}</p>
          </div>
        ) : (
          <div>
            <p className="font-medium">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-muted-foreground">
              JPG/PNG/WebP supported (demo)
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
