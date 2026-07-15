import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  SECRETARIA: "/secretaria",
  VENDEDOR: "/vendedor",
  ADMIN: "/admin",
  CUADRILLA: "/cuadrilla"
};

export default async function Home() {
  const session = await getSession();
  redirect(session ? ROLE_HOME[session.role] : "/login");
}
