import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { done } = await request.json();
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { done },
  });
  return NextResponse.json(todo);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;
  await prisma.todo.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
