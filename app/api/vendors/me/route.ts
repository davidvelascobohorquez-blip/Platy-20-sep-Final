import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "VENDEDOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.uid } });
  return NextResponse.json({ vendor });
}
