import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const items = await prisma.dailyItem.findMany({
      orderBy: { createdAt: "asc" },
    });
    const today = todayStr();
    return NextResponse.json(
      items.map((item) => ({ ...item, done: item.completedDate === today }))
    );
  } catch (e) {
    console.error("[GET /api/daily]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const { text } = await request.json();
    const item = await prisma.dailyItem.create({ data: { text } });
    return NextResponse.json({ ...item, done: false }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/daily]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
