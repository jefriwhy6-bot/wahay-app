import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { lastChatAt: "desc" },
    include: {
      _count: { select: { conversations: true, orders: true } },
    },
  });
  return NextResponse.json(contacts);
}
