"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function ThumbnailCard({ item }: { item: any }) {
  const img = item.generatedImageUrl || item.originalImageUrl;

  return (
    <Link href={`/thumb/${item._id}`}>
      <Card className="rounded-2xl hover:shadow-md transition">
        <CardContent className="p-3 space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
            <Image src={img} alt="thumb" fill className="object-cover" />
          </div>
          <p className="line-clamp-2 text-sm font-medium">{item.prompt}</p>
          <p className="text-xs text-muted-foreground">
            {item.settings?.stylePreset} • {item.settings?.resolution}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
