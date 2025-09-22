// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKeyFromRequest } from "@/lib/verifyApiKey";

export async function POST(req: Request) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, rating, comment } = await req.json();
  if (!articleId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "rating 1-5" }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { userId_articleId: { userId: apiKey.userId, articleId } },
    create: { userId: apiKey.userId, articleId, rating, comment },
    update: { rating, comment, createdAt: new Date() },
  });

  return NextResponse.json({ success: true, review });
}
