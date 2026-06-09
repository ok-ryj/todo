import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type AccelerateClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AccelerateClient | undefined;
};

function createClient() {
  // Prisma 7: url は schema.prisma ではなくコンストラクタの accelerateUrl で渡す
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
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
