import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const categories = await prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ products, categories });
}

export async function POST(req: NextRequest) {
  const { name, description, price, stock, categoryId, imageUrl, isActive, variants } =
    await req.json();

  if (!name || price === undefined) {
    return NextResponse.json({ error: "Nama dan harga wajib diisi" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: categoryId || null,
      imageUrl,
      isActive: isActive ?? true,
      variants: variants || null,
    },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (data.price) data.price = parseFloat(data.price);
  if (data.stock) data.stock = parseInt(data.stock);

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
