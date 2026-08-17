"use client";

import {
  useEffect,
  useState,
} from "react";

const FEATURES = [
  {
    number: "01",
    title: "Write naturally",
    text: "Dump your real experience into the form. No corporate vocabulary or perfect writing required.",
  },
  {
    number: "02",
    title: "Let AI sharpen it",
    text: "ResumeForge improves clarity, structure, and wording without inventing achievements or qualifications.",
  },
  {
    number: "03",
    title: "Make it yours",
    text: "Choose a resume style, refine the wording with AI, then save or print the finished result.",
  },
];

const TRUST_POINTS = [
  "Truthful AI rewriting",
  "ATS-friendly structure",
  "Multiple resume designs",
  "AI editing after generation",
  "Free account available",
];

export default function HomePage() {
  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 20
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f3] text-zinc-900">

      {/* NAV */}

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-zinc-200/80 bg-[#f5f5f3]/90 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">

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

          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="/auth/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
            >
              Sign in
            </a>

            <a
              href="/auth/sign-up"
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-black"
            >
              Get started
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
          <div className="absolute right-[-180px] top-[120px] h-[400px] w-[400px] rounded-full bg-violet-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">

          <div className="max-w-4xl">

            <div className="status-pill">
              <span className="status-dot" />
              AI-powered resume builder
            </div>

            <h1 className="mt-6 text-[clamp(3.3rem,8vw,7rem)] font-bold leading-[0.9] tracking-[-0.075em]">
              Your experience.
              <br />
              <span className="text-zinc-400">
                Better presented.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
              Turn rough notes, part-time jobs,
              school projects, internships, and
              real-world experience into a
              professional resume without
              pretending to be someone you're not.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href="/create"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-black"
              >
                Build my resume
                <span className="ml-2">
                  →
                </span>
              </a>

              <a
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                Create a free account
              </a>

            </div>

            <p className="mt-4 text-xs text-zinc-400">
              No perfect writing required. Start
              with what you've actually done.
            </p>

          </div>

          {/* HERO PREVIEW */}

          <div className="relative mt-16 sm:mt-20">

            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-indigo-200/20 via-transparent to-violet-200/20 blur-2xl" />

            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_100px_rgba(24,24,27,0.12)]">

              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-7">

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                  ResumeForge
                </span>

              </div>

              <div className="grid min-h-[420px] md:grid-cols-[0.85fr_1.15fr]">

                {/* FORM PREVIEW */}

                <div className="border-b border-zinc-100 bg-[#fafaf9] p-6 md:border-b-0 md:border-r sm:p-8">

                  <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Build your profile
                    </p>

                    <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                      Tell us what you've done.
                    </h2>
                  </div>

                  <PreviewField
                    label="Name"
                    value="Alex Morgan"
                  />

                  <PreviewField
                    label="Professional title"
                    value="Marketing Assistant"
                  />

                  <PreviewField
                    label="Experience"
                    value="Handled customers, cash, stock, and busy shifts."
                  />

                  <PreviewField
                    label="Skills"
                    value="Communication, Excel, Customer Service"
                  />

                  <div className="mt-5 h-11 rounded-xl bg-zinc-900/5" />

                </div>

                {/* RESUME PREVIEW */}

                <div className="bg-white p-6 sm:p-8">

                  <div className="border-b-2 border-zinc-900 pb-5">

                    <div className="h-7 w-48 rounded bg-zinc-900/90" />

                    <div className="mt-2 h-3 w-36 rounded bg-zinc-200" />

                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="h-2 w-28 rounded bg-zinc-100" />
                      <span className="h-2 w-24 rounded bg-zinc-100" />
                      <span className="h-2 w-24 rounded bg-zinc-100" />
                    </div>

                  </div>

                  <PreviewResumeSection
                    title="Professional Summary"
                    lines={[
                      "Professional and adaptable worker with",
                      "experience supporting customers and",
                      "maintaining efficient daily operations.",
                    ]}
                  />

                  <PreviewResumeSection
                    title="Experience"
                    lines={[
                      "Marketing Assistant",
                      "Supported customer-facing operations and",
                      "helped maintain an organized workplace.",
                    ]}
                  />

                  <PreviewResumeSection
                    title="Skills"
                    lines={[
                      "Customer Service • Communication • Excel",
                    ]}
                  />

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-5 py-6 sm:px-8">

          {TRUST_POINTS.map(
            (item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-500"
              >
                <span className="text-emerald-500">
                  ✓
                </span>

                {item}
              </div>
            )
          )}

        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">

        <div className="max-w-2xl">

          <p className="eyebrow">
            How it works
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            From raw notes to
            <br />
            a real resume.
          </h2>

          <p className="mt-5 text-base leading-7 text-zinc-500">
            ResumeForge is designed around one
            simple idea: make your existing
            experience easier to present.
          </p>

        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">

          {FEATURES.map(
            (feature) => (
              <article
                key={feature.number}
                className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500">
                  {feature.number}
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-[-0.035em]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {feature.text}
                </p>
              </article>
            )
          )}

        </div>
      </section>

      {/* AI PHILOSOPHY */}

      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">

          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Our approach
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.06em] sm:text-6xl">
                AI should improve
                your story.
                <br />
                Not invent one.
              </h2>

            </div>

            <div className="max-w-md">

              <p className="text-sm leading-7 text-zinc-400">
                ResumeForge is designed to
                preserve the facts you provide
                while making them clearer,
                stronger, and easier for recruiters
                to understand.
              </p>

              <a
                href="/create"
                className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100"
              >
                Try it free →
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">

          <div className="max-w-2xl">

            <p className="eyebrow">
              Start now
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
              You already have
              the experience.
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-500">
              Give it a better presentation.
            </p>

            <a
              href="/create"
              className="mt-7 inline-flex rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-black"
            >
              Create my resume →
            </a>

          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-zinc-200 bg-[#f5f5f3]">

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="flex items-center gap-2.5">

              <span className="brand-mark">
                R
              </span>

              <span className="text-[17px] font-bold tracking-[-0.04em]">
                ResumeForge
              </span>

            </div>

            <p className="mt-3 max-w-sm text-xs leading-5 text-zinc-400">
              Better presentation for the
              experience you already have.
            </p>

          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-zinc-400">

            <a
              href="/privacy"
              className="transition hover:text-zinc-900"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="transition hover:text-zinc-900"
            >
              Terms
            </a>

            <a
              href="/auth/login"
              className="transition hover:text-zinc-900"
            >
              Sign in
            </a>

            <a
              href="/auth/sign-up"
              className="transition hover:text-zinc-900"
            >
              Sign up
            </a>

          </div>
        </div>
      </footer>

    </main>
  );
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs text-zinc-500 shadow-sm">
        {value}
      </div>
    </div>
  );
}

function PreviewResumeSection({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <section className="mt-6">

      <div className="mb-3 border-b border-zinc-200 pb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-800">
        {title}
      </div>

      <div className="space-y-1.5">
        {lines.map(
          (line) => (
            <div
              key={line}
              className="h-2 rounded bg-zinc-100 text-[10px] leading-none text-zinc-400"
            />
          )
        )}
      </div>

    </section>
  );
}