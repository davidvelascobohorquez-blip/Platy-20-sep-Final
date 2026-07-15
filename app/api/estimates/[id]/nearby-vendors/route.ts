import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTravelInfo } from "@/lib/geo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || (session.role !== "SECRETARIA" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const estimate = await prisma.estimate.findUnique({ where: { id: params.id } });
  if (!estimate) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const vendors = await prisma.vendor.findMany({
    where: { active: true },
    include: {
      user: { select: { name: true } },
      estimates: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }
    }
  });

  const results = await Promise.all(
    vendors.map(async (v) => {
      let travel: { minutes: number; km: number; estimated: boolean } | null = null;
      if (v.lat != null && v.lng != null && estimate.lat != null && estimate.lng != null) {
        travel = await getTravelInfo({ lat: v.lat, lng: v.lng }, { lat: estimate.lat, lng: estimate.lng });
      }
      return {
        id: v.id,
        name: v.user.name,
        queue: v.estimates.length,
        travelMinutes: travel?.minutes ?? null,
        distanceKm: travel?.km ?? null,
        estimated: travel?.estimated ?? true
      };
    })
  );

  results.sort((a, b) => {
    if (a.travelMinutes == null) return 1;
    if (b.travelMinutes == null) return -1;
    return a.travelMinutes - b.travelMinutes;
  });

  return NextResponse.json({ vendors: results });
}
