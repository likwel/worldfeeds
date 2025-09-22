// app/api/favorites/[articleId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKeyFromRequest } from "@/lib/verifyApiKey";

export async function DELETE(req: Request, { params }: { params: { articleId: string } }) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.favorite.deleteMany({
    where: { userId: apiKey.userId, articleId: params.articleId },
  });
  return NextResponse.json({ success: true });
}
