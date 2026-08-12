"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string | null;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadFaqs();
  }, []);

  async function loadFaqs() {
    const res = await fetch("/api/faq");
    setFaqs(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setQuestion("");
    setAnswer("");
    setKeywords("");
    setCategory("");
    setEditingId(null);
  }

  function openEdit(faq: Faq) {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setKeywords(faq.keywords.join(", "));
    setCategory(faq.category || "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!question || !answer) {
      toast.error("Pertanyaan dan jawaban wajib diisi");
      return;
    }
    setSaving(true);
    const body = {
      id: editingId,
      question,
      answer,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      category: category || null,
    };

    const res = await fetch("/api/faq", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editingId ? "FAQ diperbarui!" : "FAQ ditambahkan!");
      setDialogOpen(false);
      resetForm();
      loadFaqs();
    } else {
      toast.error("Gagal menyimpan FAQ");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    await fetch("/api/faq", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("FAQ dihapus");
    loadFaqs();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">FAQ Template</h1>
          <Badge variant="secondary">{faqs.length}</Badge>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            <Plus className="w-4 h-4" /> Tambah FAQ
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit FAQ" : "Tambah FAQ Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pertanyaan</Label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Jam buka toko?"
                />
              </div>
              <div className="space-y-2">
                <Label>Jawaban</Label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Contoh: Kami buka setiap hari Senin-Sabtu, jam 09:00-17:00"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Keywords (pisah koma)</Label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="jam buka, buka, tutup"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Umum, Pengiriman, dll"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Belum ada FAQ. Tambahkan pertanyaan & jawaban yang sering ditanyakan pelanggan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{faq.question}</p>
                    <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {faq.category && (
                        <Badge variant="outline">{faq.category}</Badge>
                      )}
                      {faq.keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(faq)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
