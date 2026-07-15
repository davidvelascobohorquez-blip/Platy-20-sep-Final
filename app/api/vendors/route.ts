import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { name: true } },
      estimates: {
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return NextResponse.json({ vendors });
}
