"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Clock, MessageSquare, AlertTriangle, Star, Loader2 } from "lucide-react";

interface AgentStat {
  id: string;
  name: string;
  email: string;
  role: string;
  chatsHandled: number;
  chatsResolved: number;
  escalated: number;
  avgResponseMs: number | null;
  avgResponseFormatted: string;
  avgRating: string | null;
  resolutionRate: number;
}

interface Summary {
  totalAgents: number;
  totalChatsHandled: number;
  totalEscalated: number;
  avgResponseAll: string;
}

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    fetchData();
  }, [days]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent-performance?days=${days}`);
      const data = await res.json();
      setAgents(data.agents || []);
      setSummary(data.summary || null);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            Agent Performance
          </h1>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari</SelectItem>
            <SelectItem value="14">14 Hari</SelectItem>
            <SelectItem value="30">30 Hari</SelectItem>
            <SelectItem value="90">90 Hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Total Agent</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {summary.totalAgents}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-gray-500">Chat Handled</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {summary.totalChatsHandled}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500">Escalated</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {summary.totalEscalated}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">Avg Response</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {summary.avgResponseAll}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agent Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Performa Per Agent</CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada data agent</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4">Agent</th>
                    <th className="pb-3 pr-4 text-center">Chat</th>
                    <th className="pb-3 pr-4 text-center">Resolved</th>
                    <th className="pb-3 pr-4 text-center">Escalated</th>
                    <th className="pb-3 pr-4 text-center">Avg Response</th>
                    <th className="pb-3 pr-4 text-center">Rating</th>
                    <th className="pb-3 text-center">Resolution %</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-gray-800">{agent.name}</p>
                          <p className="text-xs text-gray-400">{agent.role}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center font-medium">
                        {agent.chatsHandled}
                      </td>
                      <td className="py-3 pr-4 text-center text-emerald-600 font-medium">
                        {agent.chatsResolved}
                      </td>
                      <td className="py-3 pr-4 text-center text-orange-500 font-medium">
                        {agent.escalated}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {agent.avgResponseFormatted}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {agent.avgRating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {agent.avgRating}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${agent.resolutionRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {agent.resolutionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
