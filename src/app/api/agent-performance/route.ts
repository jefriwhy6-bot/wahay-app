import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const agents = await prisma.user.findMany({
      where: { role: { in: ["AGENT", "ADMIN", "OWNER"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const metrics = await prisma.agentMetric.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        assignedTo: { not: null },
        updatedAt: { gte: since },
      },
      select: {
        assignedTo: true,
        isEscalated: true,
        messages: {
          select: { createdAt: true, senderType: true },
          orderBy: { createdAt: "asc" },
          take: 10,
        },
      },
    });

    const agentStats = agents.map((agent) => {
      const agentMetrics = metrics.filter((m) => m.userId === agent.id);
      const agentConvos = conversations.filter((c) => c.assignedTo === agent.id);

      const totalChats = agentConvos.length;
      const escalated = agentConvos.filter((c) => c.isEscalated).length;

      let totalResponseTime = 0;
      let responseCount = 0;

      for (const convo of agentConvos) {
        const msgs = convo.messages;
        for (let i = 1; i < msgs.length; i++) {
          if (msgs[i].senderType === "USER" && msgs[i - 1].senderType === "CONTACT") {
            const diff = msgs[i].createdAt.getTime() - msgs[i - 1].createdAt.getTime();
            if (diff > 0 && diff < 86400000) {
              totalResponseTime += diff;
              responseCount++;
            }
          }
        }
      }

      const avgResponseMs = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : null;

      const totalRating = agentMetrics.reduce((sum, m) => sum + m.totalRating, 0);
      const ratingCount = agentMetrics.reduce((sum, m) => sum + m.ratingCount, 0);
      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;

      const chatsHandled = agentMetrics.reduce((sum, m) => sum + m.chatsHandled, 0) || totalChats;
      const chatsResolved = agentMetrics.reduce((sum, m) => sum + m.chatsResolved, 0);

      return {
        id: agent.id,
        name: agent.name || agent.email,
        email: agent.email,
        role: agent.role,
        chatsHandled,
        chatsResolved,
        escalated,
        avgResponseMs,
        avgResponseFormatted: avgResponseMs ? formatMs(avgResponseMs) : "-",
        avgRating,
        resolutionRate: chatsHandled > 0
          ? Math.round((chatsResolved / chatsHandled) * 100)
          : 0,
      };
    });

    agentStats.sort((a, b) => b.chatsHandled - a.chatsHandled);

    const summary = {
      totalAgents: agents.length,
      totalChatsHandled: agentStats.reduce((s, a) => s + a.chatsHandled, 0),
      totalEscalated: agentStats.reduce((s, a) => s + a.escalated, 0),
      avgResponseAll: calculateOverallAvgResponse(agentStats),
    };

    return NextResponse.json({ agents: agentStats, summary });
  } catch (err) {
    console.error("Agent performance error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

function formatMs(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

function calculateOverallAvgResponse(
  agents: { avgResponseMs: number | null }[]
): string {
  const valid = agents.filter((a) => a.avgResponseMs !== null);
  if (valid.length === 0) return "-";
  const avg = valid.reduce((s, a) => s + (a.avgResponseMs || 0), 0) / valid.length;
  return formatMs(avg);
}
