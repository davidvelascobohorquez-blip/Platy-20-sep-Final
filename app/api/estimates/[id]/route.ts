import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTravelInfo } from "@/lib/geo";

const patchSchema = z.object({
  vendorId: z.string().optional(),
  status: z.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const estimate = await prisma.estimate.findUnique({ where: { id: params.id } });
  if (!estimate) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (parsed.data.vendorId !== undefined) {
    if (session.role !== "SECRETARIA" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    data.vendorId = parsed.data.vendorId;
    data.status = "ASSIGNED";
    data.assignedAt = new Date();

    if (estimate.lat != null && estimate.lng != null) {
      const vendor = await prisma.vendor.findUnique({ where: { id: parsed.data.vendorId } });
      if (vendor?.lat != null && vendor?.lng != null) {
        const travel = await getTravelInfo(
          { lat: vendor.lat, lng: vendor.lng },
          { lat: estimate.lat, lng: estimate.lng }
        );
        data.distanceKm = travel.km;
        data.travelMinutes = travel.minutes;
      }
    }
  }

  if (parsed.data.status !== undefined) {
    data.status = parsed.data.status;
    if (parsed.data.status === "IN_PROGRESS") data.startedAt = new Date();
    if (parsed.data.status === "COMPLETED") data.completedAt = new Date();
  }

  const updated = await prisma.estimate.update({ where: { id: params.id }, data });

  return NextResponse.json({ estimate: updated });
}
