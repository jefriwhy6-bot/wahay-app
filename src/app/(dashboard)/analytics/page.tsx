"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    { label: "Total Chat", value: "0", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Total Kontak", value: "0", icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Order", value: "0", icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
    { label: "Revenue", value: "Rp 0", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chat per Hari</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-sm text-gray-400">Grafik akan muncul saat ada data chat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performa Agent</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-sm text-gray-400">Data performa agent akan muncul di sini</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
