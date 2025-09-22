// app/api/auth/apikeys/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getUserFromSession(req: Request) {
  return null;
}

export async function DELETE(req: Request, { params }: { params: { id: string }}) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id, 10);
  // soft revoke
  await prisma.apiKey.updateMany({
    where: { id, userId: user.id },
    data: { revoked: true },
  });

  return NextResponse.json({ success: true });
}
