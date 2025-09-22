// app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKeyFromRequest } from "@/lib/verifyApiKey";

export async function POST(req: Request) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { articleId } = await req.json();
  const fav = await prisma.favorite.upsert({
    where: { userId_articleId: { userId: apiKey.userId, articleId } },
    update: {},
    create: { userId: apiKey.userId, articleId },
  });
  return NextResponse.json({ success: true, favorite: fav });
}
