import { config } from "dotenv";
// .env.local を優先して読み込む（Next.js の慣習に合わせる）
config({ path: ".env.local" });
config(); // .env もフォールバックとして読み込む
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
