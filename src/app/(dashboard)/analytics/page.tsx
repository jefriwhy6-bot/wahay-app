"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Users, ShoppingCart, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

interface Stats {
  totalContacts: number;
  totalConversations: number;
  totalMessages: number;
  totalOrders: number;
  totalRevenue: number;
  escalatedCount: number;
}

interface ChartItem {
  date: string;
  count: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setChartData(data.chartData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function formatPrice(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Chat", value: stats?.totalMessages || 0, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Total Kontak", value: stats?.totalContacts || 0, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Order", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
    { label: "Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Percakapan", value: stats?.totalConversations || 0, icon: MessageSquare, color: "text-cyan-600 bg-cyan-50" },
    { label: "Eskalasi", value: stats?.escalatedCount || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  ];

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Analitik</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pesan per Hari (7 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400">Belum ada data. Mulai terima pesan untuk melihat grafik.</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {chartData.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">{d.count}</span>
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${(d.count / maxCount) * 160}px`, minHeight: "4px" }}
                  />
                  <span className="text-xs text-gray-400">
                    {new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
