"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, Clock, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OperatingHour {
  open: string;
  close: string;
}

type DaySchedule = Record<string, OperatingHour | null>;

interface GreetingTemplate {
  id: string;
  type: string;
  message: string;
  isActive: boolean;
  delaySeconds: number;
}

const DAYS = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
];

const GREETING_TYPES = [
  { value: "NEW_CUSTOMER", label: "Customer Baru" },
  { value: "RETURNING_CUSTOMER", label: "Customer Kembali" },
  { value: "VIP_CUSTOMER", label: "Customer VIP" },
  { value: "AFTER_HOURS", label: "Diluar Jam Kerja" },
  { value: "HOLIDAY", label: "Hari Libur" },
];

const defaultSchedule: DaySchedule = {
  monday: { open: "08:00", close: "17:00" },
  tuesday: { open: "08:00", close: "17:00" },
  wednesday: { open: "08:00", close: "17:00" },
  thursday: { open: "08:00", close: "17:00" },
  friday: { open: "08:00", close: "17:00" },
  saturday: { open: "09:00", close: "14:00" },
  sunday: null,
};

export default function GreetingPage() {
  const [schedule, setSchedule] = useState<DaySchedule>(defaultSchedule);
  const [templates, setTemplates] = useState<GreetingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHours, setSavingHours] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    type: "NEW_CUSTOMER",
    message: "",
    delaySeconds: 2,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [hoursRes, greetingsRes] = await Promise.all([
        fetch("/api/settings/operating-hours"),
        fetch("/api/greetings"),
      ]);
      const hoursData = await hoursRes.json();
      const greetingsData = await greetingsRes.json();

      if (hoursData.operatingHours) {
        setSchedule(hoursData.operatingHours);
      }
      if (Array.isArray(greetingsData)) {
        setTemplates(greetingsData);
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function saveSchedule() {
    setSavingHours(true);
    try {
      const res = await fetch("/api/settings/operating-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatingHours: schedule }),
      });
      if (res.ok) toast.success("Jam kerja disimpan");
      else toast.error("Gagal menyimpan");
    } catch {
      toast.error("Error");
    } finally {
      setSavingHours(false);
    }
  }

  async function addTemplate() {
    if (!newTemplate.message.trim()) {
      toast.error("Pesan greeting wajib diisi");
      return;
    }
    try {
      const res = await fetch("/api/greetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates((prev) => [data, ...prev]);
        setDialogOpen(false);
        setNewTemplate({ type: "NEW_CUSTOMER", message: "", delaySeconds: 2 });
        toast.success("Greeting ditambahkan");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal");
      }
    } catch {
      toast.error("Error");
    }
  }

  async function toggleTemplate(id: string, isActive: boolean) {
    try {
      await fetch("/api/greetings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive } : t))
      );
    } catch {
      toast.error("Gagal update");
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await fetch(`/api/greetings?id=${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Greeting dihapus");
    } catch {
      toast.error("Gagal hapus");
    }
  }

  function toggleDay(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { open: "08:00", close: "17:00" },
    }));
  }

  function updateTime(day: string, field: "open" | "close", value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day]!, [field]: value } : { open: "08:00", close: "17:00" },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            Greeting & Jam Kerja
          </h1>
        </div>
      </div>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Jam Operasional
          </CardTitle>
          <CardDescription>
            Atur jam kerja bisnis. Di luar jam ini, AI akan mengirim pesan auto-reply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 border"
            >
              <Switch
                checked={schedule[key] !== null}
                onCheckedChange={() => toggleDay(key)}
              />
              <span className="w-16 sm:w-20 text-sm font-medium text-gray-700">
                {label}
              </span>
              {schedule[key] ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={schedule[key]!.open}
                    onChange={(e) => updateTime(key, "open", e.target.value)}
                    className="w-[110px] sm:w-[130px] text-sm"
                  />
                  <span className="text-gray-400 text-xs">s/d</span>
                  <Input
                    type="time"
                    value={schedule[key]!.close}
                    onChange={(e) => updateTime(key, "close", e.target.value)}
                    className="w-[110px] sm:w-[130px] text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Libur</span>
              )}
            </div>
          ))}

          <Button
            onClick={saveSchedule}
            disabled={savingHours}
            className="bg-emerald-600 hover:bg-emerald-700 mt-4"
          >
            {savingHours ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Simpan Jam Kerja
          </Button>
        </CardContent>
      </Card>

      {/* Greeting Templates */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                Template Greeting
              </CardTitle>
              <CardDescription>
                Pesan otomatis berdasarkan tipe customer dan jam operasional.
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Greeting Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Tipe</Label>
                    <Select
                      value={newTemplate.type}
                      onValueChange={(v) =>
                        setNewTemplate({ ...newTemplate, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GREETING_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pesan Greeting</Label>
                    <Textarea
                      value={newTemplate.message}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, message: e.target.value })
                      }
                      placeholder="Halo! Selamat datang di toko kami..."
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Variabel: {"{{name}}"}, {"{{phone}}"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Delay Kirim (detik)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={newTemplate.delaySeconds}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          delaySeconds: parseInt(e.target.value) || 2,
                        })
                      }
                    />
                  </div>
                  <Button onClick={addTemplate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Simpan Greeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada greeting template</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        {GREETING_TYPES.find((gt) => gt.value === t.type)?.label || t.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t.delaySeconds}s delay
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                      {t.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={t.isActive}
                      onCheckedChange={(v) => toggleTemplate(t.id, v)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(t.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
