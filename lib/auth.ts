import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.replace("Bearer ", "").trim();
  const keyRecord = await prisma.apiKey.findUnique({
    where: { hashedKey: apiKey, revoked: false },
    include: { user: true },
  });

  if (!keyRecord || (keyRecord.expiresAt && keyRecord.expiresAt < new Date())) {
    return null;
  }

  // Mise à jour de la date de dernière utilisation
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  return keyRecord.user;
}
