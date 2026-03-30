import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";

  if (connectionString.includes("neon.tech")) {
    // Try connectionString approach first (works for most queries)
    // Fall back to neon() function approach if needed
    try {
      const { PrismaNeonHttp } = require("@prisma/adapter-neon");
      const { neon } = require("@neondatabase/serverless");

      // PrismaNeonHttp v7.6+ accepts connectionString directly
      // PrismaNeonHttp v7.5 accepts neon() function
      // Try connectionString first
      let adapter: any;
      try {
        adapter = new PrismaNeonHttp(connectionString);
      } catch {
        const sql = neon(connectionString);
        adapter = new PrismaNeonHttp(sql);
      }

      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (e) {
      console.error("Failed to create Neon adapter:", e);
    }
  }

  // Local development — use PrismaPg
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch {
    return new PrismaClient({ log: ["error"] });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
