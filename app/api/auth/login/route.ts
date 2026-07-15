import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, Role } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const ROLE_HOME: Record<string, string> = {
  SECRETARIA: "/secretaria",
  VENDEDOR: "/vendedor",
  ADMIN: "/admin",
  CUADRILLA: "/cuadrilla"
};

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const role = user.role as Role;
  await createSession({ uid: user.id, role, name: user.name });

  return NextResponse.json({ redirect: ROLE_HOME[role] });
}
