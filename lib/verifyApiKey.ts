// lib/verifyApiKey.ts
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function verifyApiKeyFromRequest(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.split(" ")[1];
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey: hashed },
    include: { user: true },
  });

  if (!apiKey) return null;
  if (apiKey.revoked) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // update lastUsedAt
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}
