"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ThumbnailCard({ item }: { item: any }) {
  const img = item.generatedImageUrl || item.originalImageUrl;

  return (
    <Link href={`/thumb/${item._id}`}>
      <Card className="group rounded-3xl transition hover:shadow-md">
        <CardContent className="p-3 space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border">
            <Image
              src={img}
              alt="thumbnail"
              fill
              className="object-cover transition group-hover:scale-[1.02]"
            />
          </div>

          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium">{item.prompt}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-xl">
              {item.settings?.stylePreset}
            </Badge>
            <Badge variant="outline" className="rounded-xl">
              {item.settings?.resolution}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
