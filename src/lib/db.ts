import { PrismaClient } from "@prisma/client";

// Only import Turso libs when needed
let prisma: PrismaClient;

const isTurso = process.env.DB_MODE === "turso";

if (isTurso) {
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");
  const { createClient } = require("@libsql/client");

  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const adapter = new PrismaLibSQL(libsql);

  prisma = new PrismaClient({
    adapter,
  });
} else {
  // Default SQLite (local dev)
  prisma = new PrismaClient();
}

// Prevent multiple instances in dev (Next.js hot reload fix)
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const db = globalForPrisma.prisma || prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
