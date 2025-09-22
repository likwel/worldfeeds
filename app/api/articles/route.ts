// app/api/articles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKeyFromRequest } from "@/lib/verifyApiKey";

const PAGE_LIMIT = 12;

export async function GET(req: Request) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const source = searchParams.get("source") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const categories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  if (source && source !== "all") where.source = source;
  if (categories.length > 0) {
    where.AND = categories.map((c) => ({ categories: { contains: c, mode: "insensitive" } }));
  }

  const total = await prisma.article.count({ where });
  const data = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  return NextResponse.json({
    success: true,
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    total,
    page,
    limit: PAGE_LIMIT,
    data,
  });
}
