import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const password = await bcrypt.hash("demo1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@trueservices.com" },
    update: {},
    create: { email: "admin@trueservices.com", passwordHash: password, name: "Administrador", role: "ADMIN" }
  });

  await prisma.user.upsert({
    where: { email: "secretaria@trueservices.com" },
    update: {},
    create: { email: "secretaria@trueservices.com", passwordHash: password, name: "Secretaria", role: "SECRETARIA" }
  });

  await prisma.user.upsert({
    where: { email: "cuadrilla@trueservices.com" },
    update: {},
    create: { email: "cuadrilla@trueservices.com", passwordHash: password, name: "Cuadrilla 1", role: "CUADRILLA" }
  });

  const vendorSeeds = [
    { email: "vendedor1@trueservices.com", name: "Carlos Vendedor", lat: 33.749, lng: -84.388 },
    { email: "vendedor2@trueservices.com", name: "Ana Vendedora", lat: 33.789, lng: -84.325 }
  ];

  for (const v of vendorSeeds) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: { email: v.email, passwordHash: password, name: v.name, role: "VENDEDOR" }
    });

    await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, lat: v.lat, lng: v.lng, locationUpdatedAt: new Date() }
    });
  }

  return NextResponse.json({ ok: true, message: "Usuarios de prueba creados. Contraseña: demo1234" });
}
