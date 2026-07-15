import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  lat: z.number(),
  lng: z.number()
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "VENDEDOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const vendor = await prisma.vendor.update({
    where: { userId: session.uid },
    data: { lat: parsed.data.lat, lng: parsed.data.lng, locationUpdatedAt: new Date() }
  });

  return NextResponse.json({ vendor });
}
