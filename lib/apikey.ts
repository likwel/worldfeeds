// lib/apikey.ts
import crypto from "crypto";

export function createApiKeyPlainAndHash() {
  // génère token en clair + hash SHA-256
  const token = crypto.randomBytes(32).toString("hex"); // 64 chars
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed, last4: token.slice(-4) };
}
