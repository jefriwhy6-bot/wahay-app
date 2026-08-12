import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, phoneNumber: true, name: true, tags: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderType: true },
        },
        _count: { select: { messages: { where: { isRead: false, senderType: "CONTACT" } } } },
      },
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      contact: c.contact,
      lastMessage: c.messages[0]?.content || "",
      lastMessageAt: c.messages[0]?.createdAt || c.updatedAt,
      lastSender: c.messages[0]?.senderType || null,
      unreadCount: c._count.messages,
      isRead: c.isRead,
      sentiment: c.sentiment,
      isEscalated: c.isEscalated,
      assignedTo: c.assignedTo,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Inbox error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
