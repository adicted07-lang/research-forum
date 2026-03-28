import { PrismaClient } from "@prisma/client";

let prismaAdapter: any = undefined;

// Only use PrismaPg adapter for local development (not serverless)
if (typeof window === "undefined" && !process.env.VERCEL) {
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    prismaAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  } catch {
    // Adapter not available — use default
  }
}

function createPrismaClient() {
  return new PrismaClient({
    ...(prismaAdapter ? { adapter: prismaAdapter } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
