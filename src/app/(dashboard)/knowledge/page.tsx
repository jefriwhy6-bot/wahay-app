"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, Trash2, Loader2, FileText } from "lucide-react";

interface KnowledgeDoc {
  id: string;
  filename: string;
  status: string;
  chunkCount: number;
  createdAt: string;
  _count: { chunks: number };
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    const res = await fetch("/api/knowledge");
    setDocs(await res.json());
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/knowledge", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${file.name}" diupload — ${data.chunkCount} chunks`);
        loadDocs();
      } else {
        toast.error(data.error || "Gagal upload");
      }
    } catch {
      toast.error("Gagal upload");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus dokumen ini?")) return;
    await fetch("/api/knowledge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Dokumen dihapus");
    loadDocs();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <Badge variant="secondary">{docs.length}</Badge>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Dokumen
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
        Upload dokumen tentang bisnis kamu (FAQ, SOP, katalog produk, kebijakan) agar AI bisa menjawab berdasarkan data yang akurat.
        Format yang didukung: <strong>.txt</strong>, <strong>.md</strong>, <strong>.csv</strong>
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Belum ada dokumen. Upload file untuk membangun knowledge base AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.filename}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={doc.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}
                        >
                          {doc.status === "ready" ? "Siap" : "Processing..."}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {doc.chunkCount || doc._count.chunks} chunks
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
