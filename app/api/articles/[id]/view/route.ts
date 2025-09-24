// app/api/articles/[id]/view/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        viewCount: { increment: 1 },
      },
      select: {
        viewCount: true,
      },
    });

    return NextResponse.json({ viewCount: updated.viewCount });
  } catch (error) {
    console.error("Erreur lors de l'incrémentation :", error);
    return NextResponse.json(
      { error: "Impossible d'incrémenter les vues" },
      { status: 500 }
    );
  }
}
