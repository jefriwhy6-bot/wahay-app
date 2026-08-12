import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brand = await prisma.brandProfile.findFirst({
      select: { operatingHours: true },
    });
    return NextResponse.json({ operatingHours: brand?.operatingHours ?? null });
  } catch (err) {
    console.error("GET operating-hours error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { operatingHours } = body;

    const existing = await prisma.brandProfile.findFirst({ select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "Brand profile belum ada" },
        { status: 400 }
      );
    }

    await prisma.brandProfile.update({
      where: { id: existing.id },
      data: { operatingHours },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT operating-hours error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
