import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// TypeScript note: narrowing `JWT_SECRET` with a separate `if (!JWT_SECRET) throw`
// check does NOT carry into functions declared later in the file (signToken,
// verifyToken below) -- TS's control-flow narrowing doesn't persist into a
// closure that could theoretically run at any later time. Combining the
// check into the declaration itself (throwing inside the expression) gives
// JWT_SECRET a real `string` type from the moment it's declared, everywhere.
const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error(
    "JWT_SECRET environment variable is required. " +
    "Never fall back to a hardcoded default secret in real code."
  );
})();

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: "organizer" | "attendee";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
