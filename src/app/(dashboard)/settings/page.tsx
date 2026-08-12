"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Bot, Phone, Building2, Loader2, Save } from "lucide-react";

interface BrandData {
  id?: string;
  businessName: string;
  description: string | null;
  tone: string;
  languageDefault: string;
  signature: string | null;
  operatingHours: Record<string, { open: string; close: string } | null>;
}

interface AiData {
  id?: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface WahaData {
  id?: string;
  baseUrl: string;
  apiKey: string;
  sessionName: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const [brand, setBrand] = useState<BrandData>({
    businessName: "",
    description: "",
    tone: "friendly",
    languageDefault: "id",
    signature: "",
    operatingHours: {},
  });

  const [ai, setAi] = useState<AiData>({
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: "",
  });

  const [waha, setWaha] = useState<WahaData>({
    baseUrl: "http://localhost:3001",
    apiKey: "",
    sessionName: "default",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.brand) setBrand(data.brand);
        if (data.ai) setAi(data.ai);
        if (data.waha) setWaha(data.waha);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(type: string, data: BrandData | AiData | WahaData) {
    setSaving(type);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan settings");
    } finally {
      setSaving("");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brand" className="gap-2">
            <Building2 className="w-4 h-4" /> Brand
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="w-4 h-4" /> AI
          </TabsTrigger>
          <TabsTrigger value="waha" className="gap-2">
            <Phone className="w-4 h-4" /> WAHA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand Profile</CardTitle>
              <CardDescription>
                Identitas bisnis yang dipakai AI sebagai context saat menjawab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Bisnis</Label>
                  <Input
                    value={brand.businessName}
                    onChange={(e) =>
                      setBrand({ ...brand, businessName: e.target.value })
                    }
                    placeholder="Nama toko/bisnis Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tone Bicara</Label>
                  <Select
                    value={brand.tone}
                    onValueChange={(v) => setBrand({ ...brand, tone: v ?? "friendly" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Ramah & Santai</SelectItem>
                      <SelectItem value="formal">Formal & Profesional</SelectItem>
                      <SelectItem value="casual">Casual & Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Bisnis</Label>
                <Textarea
                  value={brand.description ?? ""}
                  onChange={(e) =>
                    setBrand({ ...brand, description: e.target.value })
                  }
                  placeholder="Jelaskan bisnis Anda secara singkat..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bahasa Default</Label>
                  <Select
                    value={brand.languageDefault}
                    onValueChange={(v) =>
                      setBrand({ ...brand, languageDefault: v ?? "id" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Signature Pesan</Label>
                  <Input
                    value={brand.signature || ""}
                    onChange={(e) =>
                      setBrand({ ...brand, signature: e.target.value })
                    }
                    placeholder="Contoh: — Tim Customer Service"
                  />
                </div>
              </div>

              <Button
                onClick={() => save("brand", brand)}
                disabled={saving === "brand"}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving === "brand" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Brand Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi AI</CardTitle>
              <CardDescription>
                Setting koneksi ke AI provider (OpenAI-compatible)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <Input
                    value={ai.baseUrl}
                    onChange={(e) => setAi({ ...ai, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={ai.modelName}
                    onChange={(e) =>
                      setAi({ ...ai, modelName: e.target.value })
                    }
                    placeholder="gpt-4o-mini"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={ai.apiKey}
                  onChange={(e) => setAi({ ...ai, apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature ({ai.temperature})</Label>
                  <Input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ai.temperature}
                    onChange={(e) =>
                      setAi({ ...ai, temperature: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={ai.maxTokens}
                    onChange={(e) =>
                      setAi({ ...ai, maxTokens: parseInt(e.target.value) || 1024 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={ai.systemPrompt || ""}
                  onChange={(e) =>
                    setAi({ ...ai, systemPrompt: e.target.value })
                  }
                  placeholder="Instruksi untuk AI saat menjawab pelanggan..."
                  rows={4}
                />
              </div>

              <Button
                onClick={() => save("ai", ai)}
                disabled={saving === "ai"}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving === "ai" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan AI Config
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waha">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi WAHA</CardTitle>
              <CardDescription>
                Koneksi ke WhatsApp HTTP API (WAHA)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>WAHA Base URL</Label>
                <Input
                  value={waha.baseUrl}
                  onChange={(e) =>
                    setWaha({ ...waha, baseUrl: e.target.value })
                  }
                  placeholder="http://localhost:3001"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={waha.apiKey}
                    onChange={(e) =>
                      setWaha({ ...waha, apiKey: e.target.value })
                    }
                    placeholder="WAHA API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Name</Label>
                  <Input
                    value={waha.sessionName}
                    onChange={(e) =>
                      setWaha({ ...waha, sessionName: e.target.value })
                    }
                    placeholder="default"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Note:</strong> WAHA belum terhubung. Fitur ini akan aktif setelah WAHA di-deploy dan dikonfigurasi.
              </div>

              <Button
                onClick={() => save("waha", waha)}
                disabled={saving === "waha"}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving === "waha" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan WAHA Config
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
