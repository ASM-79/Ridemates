import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign up with your De Anza or Foothill-De Anza email to start carpooling.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </main>
  );
}
