"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface FollowUpRule {
  id: string;
  name: string;
  scenario: string;
  delayHours: number;
  messageTemplate: string;
  maxAttempts: number;
  isActive: boolean;
  _count: { logs: number };
}

const scenarioLabels: Record<string, string> = {
  ORDER_PENDING: "Order Pending",
  POST_PURCHASE: "Setelah Pembelian",
  INACTIVE_CUSTOMER: "Customer Tidak Aktif",
  CUSTOM: "Custom",
};

export default function FollowUpPage() {
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("POST_PURCHASE");
  const [delayHours, setDelayHours] = useState("24");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => { loadRules(); }, []);

  async function loadRules() {
    const res = await fetch("/api/follow-up");
    setRules(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setName(""); setScenario("POST_PURCHASE"); setDelayHours("24");
    setMessageTemplate(""); setMaxAttempts("1"); setIsActive(true); setEditingId(null);
  }

  function openEdit(r: FollowUpRule) {
    setEditingId(r.id); setName(r.name); setScenario(r.scenario);
    setDelayHours(r.delayHours.toString()); setMessageTemplate(r.messageTemplate);
    setMaxAttempts(r.maxAttempts.toString()); setIsActive(r.isActive); setDialogOpen(true);
  }

  async function handleSave() {
    if (!name || !messageTemplate) { toast.error("Nama dan template wajib diisi"); return; }
    setSaving(true);
    const res = await fetch("/api/follow-up", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name, scenario, delayHours, messageTemplate, maxAttempts, isActive }),
    });
    if (res.ok) {
      toast.success(editingId ? "Rule diperbarui!" : "Rule ditambahkan!");
      setDialogOpen(false); resetForm(); loadRules();
    } else { toast.error("Gagal menyimpan"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus rule ini?")) return;
    await fetch("/api/follow-up", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Rule dihapus"); loadRules();
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Auto Follow-Up</h1>
          <Badge variant="secondary">{rules.length}</Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            <Plus className="w-4 h-4" /> Tambah Rule
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Tambah"} Follow-Up Rule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nama Rule</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Follow-up setelah pembelian" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Skenario</Label>
                  <Select value={scenario} onValueChange={(v) => setScenario(v ?? "POST_PURCHASE")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER_PENDING">Order Pending</SelectItem>
                      <SelectItem value="POST_PURCHASE">Setelah Pembelian</SelectItem>
                      <SelectItem value="INACTIVE_CUSTOMER">Customer Tidak Aktif</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Delay (jam)</Label><Input type="number" value={delayHours} onChange={(e) => setDelayHours(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Template Pesan</Label>
                <Textarea value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} placeholder="Halo {{nama}}, bagaimana produk yang sudah kamu terima?" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Max Attempts</Label><Input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Aktif</Label></div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Belum ada follow-up rule. Buat aturan untuk mengirim pesan otomatis ke pelanggan.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r.id} className={!r.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <Badge variant="outline">{scenarioLabels[r.scenario]}</Badge>
                      {!r.isActive && <Badge variant="secondary">Nonaktif</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{r.messageTemplate}</p>
                    <p className="text-xs text-gray-400 mt-1">Delay: {r.delayHours}h · Max: {r.maxAttempts}x · Terkirim: {r._count.logs}x</p>
                  </div>
                  <div className="flex gap-1">
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
