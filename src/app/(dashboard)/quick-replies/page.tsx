"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Zap, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface QuickReply {
  id: string;
  title: string;
  shortcut: string;
  content: string;
  category: string | null;
}

export default function QuickRepliesPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const res = await fetch("/api/quick-replies");
    setReplies(await res.json());
    setLoading(false);
  }

  function resetForm() { setTitle(""); setShortcut(""); setContent(""); setCategory(""); setEditingId(null); }

  function openEdit(r: QuickReply) {
    setEditingId(r.id); setTitle(r.title); setShortcut(r.shortcut);
    setContent(r.content); setCategory(r.category || ""); setDialogOpen(true);
  }

  async function handleSave() {
    if (!title || !shortcut || !content) { toast.error("Semua field wajib diisi"); return; }
    setSaving(true);
    const res = await fetch("/api/quick-replies", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, title, shortcut, content, category: category || null }),
    });
    if (res.ok) {
      toast.success(editingId ? "Quick reply diperbarui!" : "Quick reply ditambahkan!");
      setDialogOpen(false); resetForm(); loadData();
    } else { toast.error("Gagal menyimpan"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus quick reply ini?")) return;
    await fetch("/api/quick-replies", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Dihapus"); loadData();
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Quick Reply</h1>
          <Badge variant="secondary">{replies.length}</Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            <Plus className="w-4 h-4" /> Tambah
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Tambah"} Quick Reply</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Judul</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Konfirmasi Order" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Shortcut</Label><Input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="/order-confirm" /></div>
                <div className="space-y-2"><Label>Kategori</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Order" /></div>
              </div>
              <div className="space-y-2">
                <Label>Isi Pesan</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Halo {{nama}}, order #{{nomor_order}} sudah dikonfirmasi!" rows={4} />
                <p className="text-xs text-gray-400">Placeholder: {"{{nama}}"}, {"{{nomor_order}}"}, {"{{produk}}"}, {"{{resi}}"}</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {replies.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Belum ada quick reply. Buat template pesan cepat untuk agent.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {replies.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{r.title}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 font-mono text-xs">{r.shortcut}</Badge>
                      {r.category && <Badge variant="outline">{r.category}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{r.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
