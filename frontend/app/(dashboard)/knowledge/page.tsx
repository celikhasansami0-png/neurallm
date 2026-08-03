"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockKnowledgeDocs } from "@/lib/mock-data";
import { UploadCloud } from "lucide-react";
// TODO: replace with live API call to /api/v1/knowledge (multipart upload)

export default function KnowledgePage() {
  const [docs, setDocs] = useState(mockKnowledgeDocs);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs((d) => [
      { id: `k-${Date.now()}`, filename: file.name, status: "processing", chunks: 0, size: `${(file.size / 1024).toFixed(0)} KB` },
      ...d,
    ]);
  }

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Documents your agents can retrieve from when answering and drafting." />

      <div
        onClick={() => fileRef.current?.click()}
        className="card flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-10 text-center"
      >
        <UploadCloud size={28} strokeWidth={1.5} className="text-muted" />
        <div className="text-sm font-medium">Click to upload, or drag a file here</div>
        <div className="text-xs text-muted">PDF, DOCX, TXT, or CSV — indexed automatically with pgvector embeddings</div>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
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
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{d.filename}</td>
                <td className="px-4 py-3"><Badge value={d.status} /></td>
                <td className="px-4 py-3 text-muted">{d.chunks}</td>
                <td className="px-4 py-3 text-muted">{d.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
