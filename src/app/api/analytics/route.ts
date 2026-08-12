import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalContacts,
      totalConversations,
      totalMessages,
      totalOrders,
      totalRevenue,
      escalatedCount,
      recentMessages,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.conversation.count({ where: { isEscalated: true } }),
      prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { createdAt: true, senderType: true },
      }),
    ]);

    const chatsByDay: Record<string, number> = {};
    recentMessages.forEach((m) => {
      const day = m.createdAt.toISOString().split("T")[0];
      chatsByDay[day] = (chatsByDay[day] || 0) + 1;
    });

    const chartData = Object.entries(chatsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return NextResponse.json({
      stats: {
        totalContacts,
        totalConversations,
        totalMessages,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        escalatedCount,
      },
      chartData,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ stats: {}, chartData: [] }, { status: 500 });
  }
}
