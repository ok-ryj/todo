import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { done } = await request.json();
  const today = todayStr();
  const item = await prisma.dailyItem.update({
    where: { id: Number(id) },
    data: { completedDate: done ? today : null },
  });
  return NextResponse.json({ ...item, done: item.completedDate === today });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;
  await prisma.dailyItem.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
