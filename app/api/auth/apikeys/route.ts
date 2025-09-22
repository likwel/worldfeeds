// app/api/auth/apikeys/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiKeyPlainAndHash } from "@/lib/apikey";

// Placeholder: remplace par ta logique d'auth server-side
async function getUserFromSession(req: Request) {
  // Exemple : lire cookie, vérifier JWT, etc.
  // return { id: 1, email: "test@example.com" } or null
  return null;
}

export async function GET(req: Request) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, last4: true, revoked: true, createdAt: true, expiresAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, keys });
}

export async function POST(req: Request) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json(); // { name?: string, expiresInDays?: number }
  const { name, expiresInDays } = payload || {};
  const { token, hashed, last4 } = createApiKeyPlainAndHash();

  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;

  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      hashedKey: hashed,
      last4,
      expiresAt,
    },
  });

  // renvoyer le token EN CLAIR UNE SEULE FOIS
  return NextResponse.json({
    success: true,
    token,
    note: "Copy the token now — it will not be shown again.",
  }, { status: 201 });
}
