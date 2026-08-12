"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Loader2, Shield } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
};

const roleColors: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-blue-100 text-blue-800",
  AGENT: "bg-gray-100 text-gray-800",
};

export default function BroadcastPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AGENT");

  useEffect(() => { loadTeam(); }, []);

  async function loadTeam() {
    const res = await fetch("/api/team");
    setMembers(await res.json());
    setLoading(false);
  }

  async function handleAdd() {
    if (!email || !password) { toast.error("Email dan password wajib diisi"); return; }
    setSaving(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role }),
    });
    if (res.ok) {
      toast.success("Anggota tim berhasil ditambahkan!");
      setDialogOpen(false);
      setEmail(""); setName(""); setPassword(""); setRole("AGENT");
      loadTeam();
    } else {
      const data = await res.json();
      toast.error(data.error || "Gagal menambahkan");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus anggota tim ini?")) return;
    const res = await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Anggota dihapus"); loadTeam(); }
    else { const d = await res.json(); toast.error(d.error); }
  }

  async function handleRoleChange(id: string, newRole: string) {
    await fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    toast.success("Role diperbarui");
    loadTeam();
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tim & Anggota</h1>
          <Badge variant="secondary">{members.length}</Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            <Plus className="w-4 h-4" /> Tambah Anggota
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Anggota Tim</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nama</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password untuk login" /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v ?? "AGENT")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Tambah
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
        <strong>Roles:</strong> Owner (full access) · Admin (manage settings & agents) · Agent (handle chat only)
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{m.name || m.email}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.role === "OWNER" ? (
                    <Badge className={roleColors[m.role]}>{roleLabels[m.role]}</Badge>
                  ) : (
                    <Select value={m.role} onValueChange={(v) => { if (v) handleRoleChange(m.id, v); }}>
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {m.role !== "OWNER" && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
