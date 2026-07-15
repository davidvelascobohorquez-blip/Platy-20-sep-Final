import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MINUTES_PER_VISIT = 20;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const vendors = await prisma.vendor.findMany({
    include: {
      user: true,
      estimates: {
        include: { result: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  const now = Date.now();

  const vendorStats = vendors.map((v) => {
    const completed = v.estimates.filter((e) => e.status === "COMPLETED");
    const queue = v.estimates.filter((e) => e.status === "ASSIGNED" || e.status === "IN_PROGRESS");
    const current = v.estimates.find((e) => e.status === "IN_PROGRESS");
    const minutesOnCurrent = current?.startedAt
      ? Math.round((now - new Date(current.startedAt).getTime()) / 60000)
      : null;
    const sold = completed.filter((e) => e.result?.sold);
    const estimatedFreeInMinutes = queue.reduce(
      (sum, e) => sum + (e.travelMinutes ?? 0) + MINUTES_PER_VISIT,
      0
    );
    const usesRealTravelTimes = queue.some((e) => e.travelMinutes != null);

    return {
      id: v.id,
      name: v.user.name,
      active: v.active,
      lat: v.lat,
      lng: v.lng,
      locationUpdatedAt: v.locationUpdatedAt,
      completedCount: completed.length,
      pendingQueue: queue.length,
      minutesOnCurrent,
      estimatedFreeInMinutes: Math.round(estimatedFreeInMinutes),
      usesRealTravelTimes,
      closingRate: completed.length ? Math.round((sold.length / completed.length) * 100) : null
    };
  });

  const allCompleted = vendors.flatMap((v) => v.estimates.filter((e) => e.status === "COMPLETED"));
  const allSold = allCompleted.filter((e) => e.result?.sold);
  const totalRevenue = allSold.reduce((sum, e) => sum + (e.result?.quoteAmount || 0), 0);

  return NextResponse.json({
    vendors: vendorStats,
    summary: {
      totalCompleted: allCompleted.length,
      totalSold: allSold.length,
      closingRate: allCompleted.length ? Math.round((allSold.length / allCompleted.length) * 100) : null,
      totalRevenue
    }
  });
}
