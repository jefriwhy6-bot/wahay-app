import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WahaWebhookPayload {
  event: string;
  session: string;
  payload: {
    id: string;
    timestamp: number;
    from: string;
    fromMe: boolean;
    to: string;
    body: string;
    hasMedia: boolean;
    mediaUrl: string | null;
    type: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const data: WahaWebhookPayload = await req.json();

    if (data.event !== "message") {
      return NextResponse.json({ ok: true });
    }

    const { payload } = data;
    const phoneNumber = payload.from.replace("@c.us", "").replace("@s.whatsapp.net", "");
    const isFromMe = payload.fromMe;

    const contact = await prisma.contact.upsert({
      where: { phoneNumber },
      update: { lastChatAt: new Date() },
      create: { phoneNumber, lastChatAt: new Date() },
    });

    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, isRead: false },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          lastMessageAt: new Date(),
          isRead: isFromMe,
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          isRead: isFromMe,
          updatedAt: new Date(),
        },
      });
    }

    const mediaType = payload.hasMedia
      ? payload.type === "image"
        ? "IMAGE"
        : payload.type === "video"
          ? "VIDEO"
          : payload.type === "audio" || payload.type === "ptt"
            ? "AUDIO"
            : "DOCUMENT"
      : null;

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: isFromMe ? "USER" : "CONTACT",
        content: payload.body || "",
        mediaType: mediaType as "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | null,
        mediaUrl: payload.mediaUrl,
        isRead: isFromMe,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
