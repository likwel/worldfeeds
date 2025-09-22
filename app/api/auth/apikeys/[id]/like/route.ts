// app/api/articles/[id]/like/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKeyFromRequest } from "@/lib/verifyApiKey";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articleId = params.id;
  const userId = apiKey.userId;

  // create like if not exists
  await prisma.like.upsert({
    where: { userId_articleId: { userId, articleId } },
    update: {},
    create: { userId, articleId },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const apiKey = await verifyApiKeyFromRequest(req);
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articleId = params.id;
  const userId = apiKey.userId;

  await prisma.like.deleteMany({ where: { userId, articleId } });
  return NextResponse.json({ success: true });
}
