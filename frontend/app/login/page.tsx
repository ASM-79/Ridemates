import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back to Ridemates.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
