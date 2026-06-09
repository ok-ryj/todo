import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  const { text } = await request.json();
  const todo = await prisma.todo.create({ data: { text } });
  return NextResponse.json(todo, { status: 201 });
}
