import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";

  if (connectionString.includes("neon.tech")) {
    // Use Neon HTTP adapter for serverless environments
    const { neon } = require("@neondatabase/serverless");
    const { PrismaNeonHttp } = require("@prisma/adapter-neon");
    const sql = neon(connectionString);
    const adapter = new PrismaNeonHttp(sql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
