"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { UploadCloud } from "lucide-react";
import { api } from "@/lib/api";

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.knowledge();
      setDocs(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load knowledge base.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadKnowledge(file);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Documents your agents can retrieve from when answering and drafting." />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="card flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-10 text-center"
      >
        <UploadCloud size={28} strokeWidth={1.5} className="text-muted" />
        <div className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload, or drag a file here"}</div>
        <div className="text-xs text-muted">PDF, DOCX, TXT, or CSV — indexed automatically with pgvector embeddings</div>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} disabled={uploading} />
      </div>

      <div className="mt-8 card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Chunks</th>
              <th className="px-4 py-3 font-medium">Size</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">Loading documents…</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">No documents uploaded yet.</td></tr>
            ) : (
              docs.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{d.filename}</td>
                  <td className="px-4 py-3"><Badge value={d.status} /></td>
                  <td className="px-4 py-3 text-muted">{d.chunk_count}</td>
                  <td className="px-4 py-3 text-muted">{formatSize(d.size_bytes)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
