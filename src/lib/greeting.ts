import { prisma } from "@/lib/prisma";

interface OperatingHour {
  open: string;
  close: string;
}

type OperatingHours = Record<string, OperatingHour | null>;

export function isWithinOperatingHours(operatingHours: OperatingHours | null): boolean {
  if (!operatingHours) return true;

  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = dayNames[now.getDay()];
  const schedule = operatingHours[today];

  if (!schedule) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = schedule.open.split(":").map(Number);
  const [closeH, closeM] = schedule.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export async function getGreetingMessage(
  contactPhone: string,
  isWithinHours: boolean
): Promise<string | null> {
  const contact = await prisma.contact.findUnique({
    where: { phoneNumber: contactPhone },
    select: { firstChatAt: true, lastChatAt: true, orderCount: true, tags: true },
  });

  if (!contact) return null;

  const brand = await prisma.brandProfile.findFirst({ select: { id: true } });
  if (!brand) return null;

  let greetingType: string;

  if (!isWithinHours) {
    greetingType = "AFTER_HOURS";
  } else if (contact.orderCount >= 5 || contact.tags.includes("vip")) {
    greetingType = "VIP_CUSTOMER";
  } else {
    const hoursSinceFirst = (Date.now() - contact.firstChatAt.getTime()) / 3600000;
    greetingType = hoursSinceFirst < 1 ? "NEW_CUSTOMER" : "RETURNING_CUSTOMER";
  }

  const template = await prisma.greetingTemplate.findFirst({
    where: {
      brandProfileId: brand.id,
      type: greetingType as "NEW_CUSTOMER" | "RETURNING_CUSTOMER" | "VIP_CUSTOMER" | "AFTER_HOURS" | "HOLIDAY",
      isActive: true,
    },
  });

  if (!template) return null;

  let message = template.message;
  message = message.replace("{{name}}", contact.tags?.[0] || "Pelanggan");
  message = message.replace("{{phone}}", contactPhone);

  return message;
}

export async function shouldSendGreeting(
  conversationId: string
): Promise<boolean> {
  const messageCount = await prisma.message.count({
    where: { conversationId },
  });
  return messageCount <= 1;
}
