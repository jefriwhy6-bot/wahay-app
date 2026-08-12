import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@wahay.app" },
    update: {},
    create: {
      email: "admin@wahay.app",
      passwordHash,
      name: "Admin",
      role: "OWNER",
      languagePref: "id",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  const brand = await prisma.brandProfile.upsert({
    where: { id: "default-brand" },
    update: {},
    create: {
      id: "default-brand",
      businessName: "My Business",
      description: "Deskripsi bisnis Anda di sini",
      tone: "friendly",
      languageDefault: "id",
      operatingHours: {
        mon: { open: "09:00", close: "17:00" },
        tue: { open: "09:00", close: "17:00" },
        wed: { open: "09:00", close: "17:00" },
        thu: { open: "09:00", close: "17:00" },
        fri: { open: "09:00", close: "17:00" },
        sat: { open: "09:00", close: "14:00" },
        sun: null,
      },
      holidays: [],
    },
  });
  console.log(`Created brand profile: ${brand.businessName}`);

  const wahaConfig = await prisma.wahaConfig.upsert({
    where: { id: "default-waha" },
    update: {},
    create: {
      id: "default-waha",
      baseUrl: "http://localhost:3001",
      apiKey: "",
      sessionName: "default",
      status: "disconnected",
    },
  });
  console.log(`Created WAHA config: ${wahaConfig.baseUrl}`);

  const aiConfig = await prisma.aiConfig.upsert({
    where: { id: "default-ai" },
    update: {},
    create: {
      id: "default-ai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt:
        "Kamu adalah asisten customer service yang ramah dan helpful. Jawab pertanyaan pelanggan dengan sopan dan informatif berdasarkan knowledge base yang tersedia.",
    },
  });
  console.log(`Created AI config: ${aiConfig.modelName}`);

  const escalationRule = await prisma.escalationRule.upsert({
    where: { id: "default-rule" },
    update: {},
    create: {
      id: "default-rule",
      isActive: true,
      sentimentThreshold: "ANGRY",
      keywords: ["manajer", "manager", "komplain", "refund", "pengembalian"],
      maxUnanswered: 5,
      autoDisableAi: true,
    },
  });
  console.log(`Created escalation rule: ${escalationRule.id}`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
