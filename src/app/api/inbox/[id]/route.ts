import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.conversation.update({
      where: { id },
      data: { isRead: true },
    });

    await prisma.message.updateMany({
      where: { conversationId: id, isRead: false, senderType: "CONTACT" },
      data: { isRead: true },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Gagal memuat chat" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, mediaType, mediaUrl } = await req.json();

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: "Content wajib diisi" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { contact: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderType: "USER",
        content: content || "",
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        isRead: true,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date(), updatedAt: new Date() },
    });

    const config = await prisma.wahaConfig.findFirst();
    if (config && config.status === "connected") {
      const { sendText } = await import("@/lib/waha");
      const chatId = `${conversation.contact.phoneNumber}@c.us`;
      await sendText(config, chatId, content);
    }

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
