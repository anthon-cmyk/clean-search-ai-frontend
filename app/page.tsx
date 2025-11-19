import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-slate-900">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-zinc-50">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Welcome
          </h1>

          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Sign in to access your account
          </p>

          <div className="flex gap-4 mt-6">
            <Link
              href="/sign-in"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="rounded-md bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
