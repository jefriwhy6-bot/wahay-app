import { Radio } from "lucide-react";

export default function BroadcastPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Broadcast</h1>
      </div>
      <p className="text-gray-500">Kirim pesan massal ke pelanggan</p>
    </div>
  );
}
