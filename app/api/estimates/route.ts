import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { geocodeAddress, getTravelInfo } from "@/lib/geo";

const createSchema = z.object({
  clientName: z.string().min(1),
  address: z.string().min(1),
  timeWindow: z.string().min(1),
  vendorId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const vendorId = req.nextUrl.searchParams.get("vendorId");

  const estimates = await prisma.estimate.findMany({
    where: vendorId ? { vendorId } : undefined,
    include: { vendor: { include: { user: { select: { name: true } } } }, result: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ estimates });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "SECRETARIA" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { clientName, address, timeWindow, vendorId } = parsed.data;

  const geo =
    parsed.data.lat != null && parsed.data.lng != null
      ? { lat: parsed.data.lat, lng: parsed.data.lng }
      : await geocodeAddress(address);

  let distanceKm: number | null = null;
  let travelMinutes: number | null = null;
  let status: "PENDING" | "ASSIGNED" = "PENDING";
  let assignedAt: Date | null = null;

  if (vendorId && geo) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (vendor?.lat != null && vendor?.lng != null) {
      const travel = await getTravelInfo({ lat: vendor.lat, lng: vendor.lng }, geo);
      distanceKm = travel.km;
      travelMinutes = travel.minutes;
    }
    status = "ASSIGNED";
    assignedAt = new Date();
  }

  const estimate = await prisma.estimate.create({
    data: {
      clientName,
      address,
      timeWindow,
      lat: geo?.lat,
      lng: geo?.lng,
      vendorId: vendorId || null,
      distanceKm,
      travelMinutes,
      status,
      assignedAt
    }
  });

  return NextResponse.json({ estimate });
}
