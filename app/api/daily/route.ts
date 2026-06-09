import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}

export async function GET() {
  const prisma = getPrisma();
  const items = await prisma.dailyItem.findMany({
    orderBy: { createdAt: "asc" },
  });
  const today = todayStr();
  return NextResponse.json(
    items.map((item) => ({ ...item, done: item.completedDate === today }))
  );
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  const { text } = await request.json();
  const item = await prisma.dailyItem.create({ data: { text } });
  return NextResponse.json({ ...item, done: false }, { status: 201 });
}
