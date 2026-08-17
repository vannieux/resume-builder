"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string | null;
  plan: string;
  monthly_generation_count: number;
  usage_month: string;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [signingOut, setSigningOut] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setError("");

    try {
      const supabase =
        createClient();

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        router.replace(
          "/auth/login"
        );
        return;
      }

      setEmail(
        user.email || ""
      );

      const {
        data,
        error:
          profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            "id,email,plan,monthly_generation_count,usage_month,created_at"
          )
          .eq(
            "id",
            user.id
          )
          .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(
        data as Profile
      );
    } catch (err) {
      console.error(
        "Account load failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your account."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      const supabase =
        createClient();

      await supabase.auth.signOut();

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(
        "Sign out failed:",
        err
      );

      setError(
        "Could not sign out."
      );

      setSigningOut(false);
    }
  }

  const used =
    profile?.monthly_generation_count ??
    0;

  const limit =
    profile?.plan === "free"
      ? 3
      : null;

  const remaining =
    limit === null
      ? null
      : Math.max(
          limit - used,
          0
        );

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-zinc-900">

      <header className="border-b border-zinc-200/80 bg-[#f5f5f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">

          <a
            href="/"
            className="group flex items-center gap-2.5"
          >
            <span className="brand-mark">
              R
            </span>

            <span className="text-[17px] font-bold tracking-[-0.04em]">
              ResumeForge
            </span>
          </a>

          <a
            href="/create"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
          >
            Resume builder
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">

        {loading ? (
          <section className="mx-auto max-w-2xl">

            <div className="mb-4 h-6 w-28 animate-pulse rounded-full bg-zinc-200" />

            <div className="h-12 w-80 animate-pulse rounded-xl bg-zinc-200" />

            <div className="mt-3 h-5 w-full max-w-lg animate-pulse rounded bg-zinc-200" />

            <div className="mt-8 h-52 animate-pulse rounded-3xl bg-zinc-200" />

          </section>
        ) : error ? (
          <section className="mx-auto max-w-2xl">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="text-sm font-semibold">
                Something went wrong.
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </section>
        ) : profile ? (
          <section className="mx-auto max-w-2xl">

            <div className="mb-8">

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500">
                Account
              </div>

              <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                Your ResumeForge account
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Manage your account and track
                your resume-generation allowance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* PLAN */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Current plan
                </p>

                <div className="mt-4 flex items-center justify-between gap-4">

                  <div>

                    <h2 className="text-2xl font-bold tracking-[-0.04em]">
                      {profile.plan ===
                      "free"
                        ? "Free"
                        : profile.plan}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {email}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                    R
                  </div>
                </div>
              </div>

              {/* USAGE */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      This month
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">
                      {used}
                      {limit !== null
                        ? ` / ${limit}`
                        : ""}
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    {remaining !== null
                      ? `${remaining} left`
                      : "Active"}
                  </span>
                </div>

                {limit !== null && (
                  <div className="mt-5">

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">

                      <div
                        className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (used /
                              limit) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-zinc-400">
                      {remaining === 0
                        ? "You've used all of your free generations this month."
                        : `You have ${remaining} resume generation${remaining === 1 ? "" : "s"} remaining this month.`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* USAGE DETAIL */}

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-bold">
                    Monthly allowance
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Your free plan includes 3
                    new resume generations per
                    calendar month.
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 px-4 py-3 text-right">

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Usage period
                  </p>

                  <p className="mt-1 text-sm font-semibold text-zinc-700">
                    {formatUsageMonth(
                      profile.usage_month
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <a
                href="/create"
                className="flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-black"
              >
                Create a resume →
              </a>

              <button
                type="button"
                onClick={
                  handleSignOut
                }
                disabled={
                  signingOut
                }
                className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
              >
                {signingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            </div>

            {/* FUTURE PLAN */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 p-7 text-white">

              <div className="max-w-xl">

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Coming later
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.045em]">
                  More resumes. More control.
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Premium plans will eventually
                  unlock higher generation limits,
                  additional templates, advanced
                  job tailoring, and a completely
                  ad-free experience.
                </p>
              </div>

            </div>

          </section>
        ) : null}
      </div>
    </main>
  );
}

function formatUsageMonth(
  value: string
): string {
  if (!value) {
    return "Current month";
  }

  const [year, month] =
    value.split("-");

  if (!year || !month) {
    return value;
  }

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
}