import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.greetingTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (err) {
    console.error("GET greetings error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, isActive, delaySeconds } = body;

    const brand = await prisma.brandProfile.findFirst({ select: { id: true } });
    if (!brand) {
      return NextResponse.json(
        { error: "Brand profile belum ada. Buat dulu di Settings." },
        { status: 400 }
      );
    }

    const template = await prisma.greetingTemplate.create({
      data: {
        brandProfileId: brand.id,
        type,
        message,
        isActive: isActive ?? true,
        delaySeconds: delaySeconds ?? 2,
      },
    });

    return NextResponse.json(template);
  } catch (err) {
    console.error("POST greeting error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, message, isActive, delaySeconds } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const template = await prisma.greetingTemplate.update({
      where: { id },
      data: {
        type,
        message,
        isActive,
        delaySeconds,
      },
    });

    return NextResponse.json(template);
  } catch (err) {
    console.error("PUT greeting error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.greetingTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE greeting error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
