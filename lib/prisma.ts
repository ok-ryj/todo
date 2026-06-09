import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type AccelerateClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AccelerateClient | undefined;
};

function createClient() {
  // PRISMA_DATABASE_URL = Prisma Accelerate URL (prisma+postgres://...)
  // DATABASE_URL        = 直接接続用 PostgreSQL URL（マイグレーション用）
  return new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
  }).$extends(withAccelerate());
}

/**
 * Prisma クライアントを遅延初期化して返す。
 * モジュール評価時ではなくリクエスト時に初めて生成されるため、
 * ビルド時にクラッシュしない。
 */
export function getPrisma(): AccelerateClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}
