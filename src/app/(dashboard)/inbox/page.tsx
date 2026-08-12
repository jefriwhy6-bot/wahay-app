"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex h-full">
      {/* Chat list sidebar */}
      <div className="w-full md:w-[380px] border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">Percakapan WhatsApp</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-7 h-7 text-emerald-300" />
            </div>
            <p className="text-sm text-gray-500">
              Belum ada percakapan. Hubungkan WAHA untuk mulai menerima pesan WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Chat detail */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="text-center space-y-3">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto" />
            <h3 className="text-lg font-medium text-gray-400">Pilih percakapan</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Pilih percakapan dari daftar di sebelah kiri untuk melihat detail chat dan membalas pesan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
