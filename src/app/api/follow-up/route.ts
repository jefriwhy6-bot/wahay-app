import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rules = await prisma.followUpRule.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { logs: true } } },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const { name, scenario, delayHours, messageTemplate, maxAttempts, isActive } = await req.json();

  if (!name || !scenario || !delayHours || !messageTemplate) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const rule = await prisma.followUpRule.create({
    data: {
      name,
      scenario,
      delayHours: parseInt(delayHours),
      messageTemplate,
      maxAttempts: parseInt(maxAttempts) || 1,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (data.delayHours) data.delayHours = parseInt(data.delayHours);
  if (data.maxAttempts) data.maxAttempts = parseInt(data.maxAttempts);

  const rule = await prisma.followUpRule.update({ where: { id }, data });
  return NextResponse.json(rule);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.followUpLog.deleteMany({ where: { ruleId: id } });
  await prisma.followUpRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
