import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

export let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    global.cachedPrisma = new PrismaClient();
  }
  db = global.cachedPrisma;
}