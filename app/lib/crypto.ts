// app/lib/crypto.ts
import { createCipheriv, randomBytes } from "crypto";

const IV_LENGTH = 16; // AES block size
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "Invalid ENCRYPTION_KEY: Must be 32 characters long. Current length: " + 
    ENCRYPTION_KEY?.length
  );
}

export async function encrypt(data: any): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY as string, "utf8"), // Type assertion since we check ENCRYPTION_KEY earlier
    iv
  );
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}