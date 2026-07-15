import { getSession } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import SecretariaDashboard from "@/components/SecretariaDashboard";

export default async function SecretariaPage() {
  const session = await getSession();
  return (
    <main className="min-h-screen bg-neutral-50">
      <TopBar title="Recepción de estimados" name={session?.name || ""} />
      <SecretariaDashboard />
    </main>
  );
}
