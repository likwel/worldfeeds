import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const apiKey = crypto.randomBytes(32).toString("hex");
  const last4 = apiKey.slice(-4);

  await prisma.apiKey.create({
    data: {
      userId: user.id,
      hashedKey: apiKey,
      last4,
    },
  });

  return NextResponse.json({
    message: "Utilisateur et clé API créés",
    apiKey,
  });
}
