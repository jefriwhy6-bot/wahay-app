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

    if (!isFromMe && payload.body) {
      const { shouldSendGreeting, getGreetingMessage, isWithinOperatingHours } =
        await import("@/lib/greeting");

      const brand = await prisma.brandProfile.findFirst({
        select: { operatingHours: true },
      });
      const withinHours = isWithinOperatingHours(
        brand?.operatingHours as Record<string, { open: string; close: string } | null> | null
      );

      const needsGreeting = await shouldSendGreeting(conversation.id);
      if (needsGreeting) {
        const greeting = await getGreetingMessage(phoneNumber, withinHours);
        if (greeting) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderType: "SYSTEM",
              content: greeting,
              isRead: true,
            },
          });

          const wahaConfig = await prisma.wahaConfig.findFirst();
          if (wahaConfig && wahaConfig.status === "connected") {
            const { sendText } = await import("@/lib/waha");
            await sendText(wahaConfig, payload.from, greeting);
          }
        }
      }

      if (!withinHours) {
        return NextResponse.json({ ok: true });
      }

      const conv = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        select: { aiEnabled: true },
      });

      if (conv?.aiEnabled) {
        try {
          const { generateAiReply } = await import("@/lib/ai-engine");
          const aiResponse = await generateAiReply(payload.body, phoneNumber);

          if (aiResponse) {
            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                senderType: "AI",
                content: aiResponse.reply,
                isRead: true,
              },
            });

            if (aiResponse.sentiment) {
              await prisma.conversation.update({
                where: { id: conversation.id },
                data: { sentiment: aiResponse.sentiment },
              });

              const { checkEscalation } = await import("@/lib/escalation");
              await checkEscalation(conversation.id, aiResponse.sentiment);
            }

            const wahaConfig = await prisma.wahaConfig.findFirst();
            if (wahaConfig && wahaConfig.status === "connected") {
              const { sendText } = await import("@/lib/waha");
              await sendText(wahaConfig, payload.from, aiResponse.reply);
            }
          }
        } catch (aiErr) {
          console.error("AI auto-reply error:", aiErr);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
