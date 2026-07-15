"use client";

import { useRouter } from "next/navigation";

export default function TopBar({ title, name }: { title: string; name: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold text-brand-dark">{title}</h1>
        <p className="text-xs text-neutral-500">Chip and Weight — True Services</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">{name}</span>
        <button
          onClick={logout}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
