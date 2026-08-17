"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase =
        createClient();

      const {
        data,
        error: signupError,
      } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        router.push("/create");
        router.refresh();
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your account."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 py-12 text-zinc-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full">

          <a
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            ← ResumeForge
          </a>

          <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl shadow-zinc-900/5 sm:p-9">

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                Free account
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Get 3 resume generations
                every month and keep your
                work available across sessions.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                {message}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="generate-button"
              >
                {loading
                  ? "Creating account..."
                  : "Create free account →"}
              </button>
            </form>

            <div className="mt-7 border-t border-zinc-100 pt-6 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?
              </p>

              <a
                href="/auth/login"
                className="mt-1 inline-block text-sm font-bold text-zinc-900 hover:underline"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}