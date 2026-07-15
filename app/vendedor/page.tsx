import { getSession } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import VendedorDashboard from "@/components/VendedorDashboard";

export default async function VendedorPage() {
  const session = await getSession();
  return (
    <main className="min-h-screen bg-neutral-50">
      <TopBar title="Mis estimados" name={session?.name || ""} />
      <VendedorDashboard />
    </main>
  );
}
