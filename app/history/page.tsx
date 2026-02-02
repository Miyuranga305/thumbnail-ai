"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";

import AppShell from "@/components/ui/AppShell";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Thumb = {
  _id: string;
  prompt: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  settings: { resolution: string; stylePreset: string };
  status: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Thumb[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("");
  const [resolution, setResolution] = useState("");

  async function fetchHistory() {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (style) params.style = style;
      if (resolution) params.resolution = resolution;

      const res = await axios.get("/api/thumbnails", { params });
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchHistory(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, style, resolution]);

  const countText = useMemo(() => {
    if (loading) return "Loading...";
    return `${items.length} item(s)`;
  }, [items.length, loading]);

  return (
    <AppShell
      title="History"
      subtitle="Search and filter your thumbnail generations"
      right={
        <Link href="/" className="hidden sm:block">
          <Button size="sm" variant="secondary">
            New generation
          </Button>
        </Link>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Generation History</h1>
          <Badge variant="outline" className="rounded-xl">
            {countText}
          </Badge>
        </div>

        <Link href="/" className="sm:hidden">
          <Button variant="secondary" className="w-full">
            New generation
          </Button>
        </Link>
      </div>

      <Card className="mb-6 rounded-3xl">
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            placeholder="Search by prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="h-10 rounded-2xl border bg-background px-3 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="">All styles</option>
            <option value="realistic">Realistic</option>
            <option value="artistic">Artistic</option>
            <option value="cartoon">Cartoon</option>
            <option value="minimalist">Minimalist</option>
          </select>

          <select
            className="h-10 rounded-2xl border bg-background px-3 text-sm"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          >
            <option value="">All resolutions</option>
            <option value="512x512">512x512</option>
            <option value="1024x1024">1024x1024</option>
            <option value="1920x1080">1920x1080</option>
          </select>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              setSearch("");
              setStyle("");
              setResolution("");
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      <ThumbnailGrid items={items} />
    </AppShell>
  );
}
