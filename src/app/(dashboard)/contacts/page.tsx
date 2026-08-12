"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2, Phone, ShoppingCart, DollarSign } from "lucide-react";

interface Contact {
  id: string;
  phoneNumber: string;
  name: string | null;
  tags: string[];
  totalSpent: number;
  orderCount: number;
  lastChatAt: string;
  _count: { conversations: number; orders: number };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
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

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Kontak</h1>
        <Badge variant="secondary">{contacts.length}</Badge>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Belum ada kontak. Kontak akan otomatis ditambahkan saat pelanggan mengirim pesan via WhatsApp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.name || "Tanpa Nama"}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3 h-3" /> {c.phoneNumber}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <ShoppingCart className="w-3 h-3" /> {c.orderCount} order
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-medium">
                      <DollarSign className="w-3 h-3" /> {formatPrice(c.totalSpent)}
                    </div>
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
