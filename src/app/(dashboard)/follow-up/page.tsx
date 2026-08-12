import { Clock } from "lucide-react";

export default function FollowUpPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Auto Follow-Up</h1>
      </div>
      <p className="text-gray-500">Atur pesan follow-up otomatis</p>
    </div>
  );
}
