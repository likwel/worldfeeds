// app/api/reviews/[articleId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { articleId: string } }) {
  const articleId = params.articleId;
  const reviews = await prisma.review.findMany({
    where: { articleId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const average = await prisma.review.aggregate({
    where: { articleId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return NextResponse.json({ success: true, reviews, average });
}
