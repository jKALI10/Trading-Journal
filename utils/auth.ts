export function validateAuthToken(token: string): boolean {
  try {
    // Verify token format and expiration
    const [hash, timestamp] = token.split(".");
    const tokenTime = Number.parseInt(timestamp);
    const now = Date.now();
    // Token valid for 30 days
    return now - tokenTime < 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hashing using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

export function generateToken(): string {
  return `${Math.random().toString(36).substr(2, 9)}.${Date.now()}`;
}

export function generateRecoveryCode(): string {
  // Generate a 12-character recovery code (e.g., XXXX-XXXX-XXXX)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function hashRecoveryCode(code: string): Promise<string> {
  // Hash the recovery code for storage
  const encoder = new TextEncoder();
  const data = encoder.encode(code.toUpperCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyRecoveryCode(
  code: string,
  hash: string
): Promise<boolean> {
  const newHash = await hashRecoveryCode(code);
  return newHash === hash;
}
