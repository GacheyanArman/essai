import "server-only";

import { createHmac } from "node:crypto";
import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/store-db";
import type { AdminUser } from "@/lib/types";

const DEVELOPMENT_COOKIE_NAME = "esexpress_admin_session";
const PRODUCTION_COOKIE_NAME = "__Host-esexpress_admin_session";
const SESSION_TTL_SECONDS = 10 * 60 * 60;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 5;
const RATE_LIMIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_ISSUER = "esexpress";
const SESSION_AUDIENCE = "esexpress-admin";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  sessionVersion: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function requiredEnvironmentValue(name: "SESSION_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  if (value.includes("REPLACE_WITH")) throw new Error(`${name} still contains a placeholder value.`);
  return value;
}

function sessionSecretText() {
  const value = requiredEnvironmentValue("SESSION_SECRET");
  if (Buffer.byteLength(value, "utf8") < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  }
  return value;
}

function sessionSecret() {
  return new TextEncoder().encode(sessionSecretText());
}


function cookieName() {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_COOKIE_NAME
    : DEVELOPMENT_COOKIE_NAME;
}

function rateLimitKey(kind: "ip" | "account", value: string) {
  return createHmac("sha256", sessionSecretText())
    .update(`${kind}:${value.trim().toLowerCase()}`)
    .digest("hex");
}

function loginRateLimitKeys(ipAddress: string, email: string) {
  return [
    rateLimitKey("ip", ipAddress || "unknown"),
    rateLimitKey("account", email),
  ];
}

export async function checkLoginRateLimit(
  ipAddress: string,
  email: string,
): Promise<RateLimitResult> {
  const now = Date.now();
  const records = await Promise.all(
    loginRateLimitKeys(ipAddress, email).map((keyHash) =>
      db.authLoginAttempt.findUnique({ where: { keyHash } }),
    ),
  );

  const blockedUntil = records.reduce(
    (latest: number, record: { blockedUntil: Date | null } | null) => {
      const timestamp = record?.blockedUntil?.getTime() ?? 0;
      return Math.max(latest, timestamp);
    },
    0,
  );

  if (blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((blockedUntil - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function recordLoginFailure(
  ipAddress: string,
  email: string,
): Promise<RateLimitResult> {
  const now = new Date();
  const nowMs = now.getTime();
  const keys = loginRateLimitKeys(ipAddress, email);
  let latestBlockedUntil = 0;

  for (const keyHash of keys) {
    const record = await db.authLoginAttempt.recordFailure({
      keyHash,
      now,
      windowStartedBefore: new Date(nowMs - RATE_LIMIT_WINDOW_MS),
      blockedUntil: new Date(nowMs + RATE_LIMIT_WINDOW_MS),
      maxFailures: RATE_LIMIT_MAX_FAILURES,
    });
    latestBlockedUntil = Math.max(
      latestBlockedUntil,
      record.blockedUntil?.getTime() ?? 0,
    );
  }

  await db.authLoginAttempt.deleteExpired({
    before: new Date(nowMs - RATE_LIMIT_RETENTION_MS),
  });

  if (latestBlockedUntil > nowMs) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((latestBlockedUntil - nowMs) / 1000),
      ),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function clearLoginFailures(ipAddress: string, email: string) {
  await db.authLoginAttempt.deleteMany({
    where: { keyHash: { in: loginRateLimitKeys(ipAddress, email) } },
  });
}

export async function authenticate(email: string, password: string) {
  const user = (await db.adminUser.findUnique({
    where: { email },
  })) as AdminUser | null;
  if (!user) return null;

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) return null;

  return user;
}

export async function createSession(user: AdminUser) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    sessionVersion: user.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());

  const store = await cookies();
  store.set(cookieName(), token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    priority: "high",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(DEVELOPMENT_COOKIE_NAME);
  store.delete(PRODUCTION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      clockTolerance: 5,
    });

    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.sessionVersion !== "number"
    )
      return null;

    const user = (await db.adminUser.findUnique({
      where: { id: payload.sub },
    })) as AdminUser | null;
    if (
      !user ||
      user.email !== payload.email ||
      user.sessionVersion !== payload.sessionVersion
    )
      return null;

    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      sessionVersion: user.sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function revokeAllAdminSessions(userId: string) {
  await db.adminUser.incrementSessionVersion({ where: { id: userId } });
  await destroySession();
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
