import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type AccelerateClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AccelerateClient | undefined;
};

function createClient() {
  return new PrismaClient().$extends(withAccelerate());
}

/**
 * Prisma クライアントを遅延初期化して返す。
 * モジュール評価時ではなくリクエスト時に初めて生成されるため、
 * ビルド時に prisma+postgres:// URL が原因でクラッシュしない。
 */
export function getPrisma(): AccelerateClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}
