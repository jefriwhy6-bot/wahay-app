import { BookOpen } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
      </div>
      <p className="text-gray-500">Upload dokumen untuk training AI</p>
    </div>
  );
}
