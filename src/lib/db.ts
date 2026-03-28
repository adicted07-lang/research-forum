import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Set up WebSocket for non-edge environments
if (typeof globalThis.WebSocket === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    neonConfig.webSocketConstructor = require("ws");
  } catch {
    // ws not available (edge runtime)
  }
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";

  // Only use Neon adapter if we have a real connection string
  if (connectionString && !connectionString.includes("localhost")) {
    try {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool as any);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch {
      // Fallback
    }
  }

  // Local development or fallback — use PrismaPg
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch {
    return new PrismaClient({
      log: ["error"],
    });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
