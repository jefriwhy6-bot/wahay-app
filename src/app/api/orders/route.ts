import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { name: true, phoneNumber: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
  return NextResponse.json(orders);
}
