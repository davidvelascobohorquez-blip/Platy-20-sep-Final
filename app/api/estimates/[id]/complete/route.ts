import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  sold: z.boolean(),
  scopeOfWork: z.string().optional(),
  quoteAmount: z.number().optional(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || (session.role !== "VENDEDOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const estimate = await prisma.estimate.update({
    where: { id: params.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      result: {
        upsert: {
          create: parsed.data,
          update: parsed.data
        }
      }
    },
    include: { result: true }
  });

  return NextResponse.json({ estimate });
}
