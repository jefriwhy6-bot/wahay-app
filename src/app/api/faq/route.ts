import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faqTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const { question, answer, keywords, category } = await req.json();

  if (!question || !answer) {
    return NextResponse.json(
      { error: "Pertanyaan dan jawaban wajib diisi" },
      { status: 400 }
    );
  }

  const faq = await prisma.faqTemplate.create({
    data: {
      question,
      answer,
      keywords: keywords || [],
      category: category || null,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, question, answer, keywords, category } = await req.json();

  const faq = await prisma.faqTemplate.update({
    where: { id },
    data: { question, answer, keywords, category },
  });
  return NextResponse.json(faq);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.faqTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
