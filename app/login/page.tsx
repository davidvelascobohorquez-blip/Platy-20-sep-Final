import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-dark">Chip and Weight</h1>
        <p className="text-neutral-500">True Services</p>
      </div>
      <LoginForm />
    </main>
  );
}
