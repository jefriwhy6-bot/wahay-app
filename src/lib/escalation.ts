import { prisma } from "@/lib/prisma";

export async function checkEscalation(
  conversationId: string,
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
): Promise<boolean> {
  if (sentiment !== "NEGATIVE") return false;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        where: { senderType: "CONTACT" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!conversation || conversation.isEscalated) return false;

  const negativeCount = conversation.messages.filter((m) => {
    const lower = m.content.toLowerCase();
    const negWords = ["marah", "kecewa", "parah", "refund", "komplain", "batal"];
    return negWords.some((w) => lower.includes(w));
  }).length;

  if (negativeCount >= 2) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isEscalated: true,
        aiEnabled: false,
        sentiment: "NEGATIVE",
      },
    });

    await prisma.escalation.create({
      data: {
        conversationId,
        reason: "ANGRY_SENTIMENT",
        triggerDetail: `Pelanggan menunjukkan sentimen negatif ${negativeCount}x dalam 5 pesan terakhir`,
      },
    });

    return true;
  }

  return false;
}
