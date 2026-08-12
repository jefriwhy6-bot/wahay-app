"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2, Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  contact: { name: string | null; phoneNumber: string };
  items: { quantity: number; price: number; product: { name: string } }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  function formatPrice(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Order</h1>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada order. Order akan dibuat otomatis saat pelanggan memesan via WhatsApp.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900">{o.orderNumber}</p>
                      <Badge className={statusColors[o.status] || ""}>{o.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{o.contact?.name || o.contact?.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatPrice(o.totalAmount)}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("id-ID")}</p>
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
