import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(todos);
  } catch (e) {
    console.error("[GET /api/todos]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const { text, dueDate } = await request.json();
    const todo = await prisma.todo.create({
      data: { text, dueDate: dueDate || null },
    });
    return NextResponse.json(todo, { status: 201 });
  } catch (e) {
    console.error("[POST /api/todos]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
