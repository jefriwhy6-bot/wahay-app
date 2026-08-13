import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCatalogProducts,
  addCatalogProduct,
  deleteCatalogProduct,
  type WaCatalogProduct,
} from "@/lib/waha";

export async function POST() {
  try {
    const wahaConfig = await prisma.wahaConfig.findFirst();
    if (!wahaConfig || wahaConfig.status !== "connected") {
      return NextResponse.json(
        { error: "WAHA belum terhubung. Hubungkan dulu di Settings." },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada produk aktif untuk di-sync." },
        { status: 400 }
      );
    }

    const config = {
      baseUrl: wahaConfig.baseUrl,
      apiKey: wahaConfig.apiKey,
      sessionName: wahaConfig.sessionName,
    };

    const existingRes = await getCatalogProducts(config);
    const existingProducts = existingRes.data || [];

    let deleted = 0;
    for (const ep of existingProducts) {
      if (ep.id) {
        await deleteCatalogProduct(config, ep.id);
        deleted++;
      }
    }

    let synced = 0;
    let failed = 0;
    const results: { name: string; status: string }[] = [];

    for (const p of products) {
      const waProduct: WaCatalogProduct = {
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        currency: "IDR",
        imageUrl: p.imageUrl || undefined,
        isHidden: p.stock <= 0,
      };

      const res = await addCatalogProduct(config, waProduct);
      if (res.success) {
        synced++;
        results.push({ name: p.name, status: "ok" });
      } else {
        failed++;
        results.push({ name: p.name, status: res.error || "failed" });
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        total: products.length,
        synced,
        failed,
        deleted,
      },
      results,
    });
  } catch (err) {
    console.error("Catalog sync error:", err);
    return NextResponse.json({ error: "Sync gagal" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const wahaConfig = await prisma.wahaConfig.findFirst();
    if (!wahaConfig || wahaConfig.status !== "connected") {
      return NextResponse.json({ connected: false, products: [] });
    }

    const config = {
      baseUrl: wahaConfig.baseUrl,
      apiKey: wahaConfig.apiKey,
      sessionName: wahaConfig.sessionName,
    };

    const res = await getCatalogProducts(config);
    return NextResponse.json({
      connected: true,
      products: res.data || [],
      error: res.error || null,
    });
  } catch (err) {
    console.error("Get WA catalog error:", err);
    return NextResponse.json({ connected: false, products: [], error: "Failed" });
  }
}
