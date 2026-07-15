import { getSession } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();
  return (
    <main className="min-h-screen bg-neutral-50">
      <TopBar title="Panel de administración" name={session?.name || ""} />
      <AdminDashboard />
    </main>
  );
}
