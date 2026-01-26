"use client";

import ThumbnailCard from "./ThumbnailCard";


export default function ThumbnailGrid({ items }: { items: any[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
        No history yet. Generate a thumbnail first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <ThumbnailCard key={it._id} item={it} />
      ))}
    </div>
  );
}
