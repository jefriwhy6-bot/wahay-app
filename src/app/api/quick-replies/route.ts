import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const replies = await prisma.quickReply.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(replies);
}

export async function POST(req: NextRequest) {
  const { title, shortcut, content, category } = await req.json();
  if (!title || !shortcut || !content) {
    return NextResponse.json({ error: "Title, shortcut, dan content wajib diisi" }, { status: 400 });
  }

  const reply = await prisma.quickReply.create({
    data: { title, shortcut, content, category },
  });
  return NextResponse.json(reply, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const reply = await prisma.quickReply.update({ where: { id }, data });
  return NextResponse.json(reply);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.quickReply.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
