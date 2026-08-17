export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] text-zinc-900">

      <header className="border-b border-zinc-200/80 bg-[#f5f5f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">

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
            href="/"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-900"
          >
            Back home
          </a>

        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">

        <p className="eyebrow">
          Legal
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-zinc-400">
          Last updated: August 17, 2026
        </p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-zinc-600">

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              1. Overview
            </h2>

            <p>
              ResumeForge is an AI-assisted resume
              creation service. This policy explains
              what information may be processed when
              you use the service and how that
              information is used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              2. Information you provide
            </h2>

            <p>
              You may provide information such as your
              name, email address, phone number,
              location, LinkedIn information,
              professional summary, education, work
              experience, projects, certifications,
              languages, skills, and target job
              descriptions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              3. How your information is used
            </h2>

            <p>
              Information you submit is used to
              generate and improve resumes and related
              features that you request. Account
              information is also used to authenticate
              you and enforce account limits.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              4. Third-party services
            </h2>

            <p>
              ResumeForge uses third-party services
              to operate the application. These may
              include Supabase for authentication and
              database functionality, Google Gemini for
              AI processing, and Cloudflare Turnstile
              for abuse prevention and security
              verification.
            </p>

            <p className="mt-4">
              Each third-party provider may process
              information according to its own
              privacy policies and terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              5. Resume content
            </h2>

            <p>
              You are responsible for the information
              you submit. Do not submit information
              that you do not have permission to use,
              or highly sensitive information that is
              unnecessary for creating your resume.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              6. Cookies and local storage
            </h2>

            <p>
              ResumeForge may use browser storage,
              cookies, or similar technologies for
              authentication, preferences, resume
              continuity, security, and service
              functionality.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              7. Security
            </h2>

            <p>
              We use reasonable technical measures to
              protect information handled by the
              application. No internet service can
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              8. Retention
            </h2>

            <p>
              Information may be retained for as long
              as necessary to provide the service,
              maintain accounts, enforce usage limits,
              troubleshoot problems, comply with legal
              obligations, or otherwise operate the
              service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              9. Changes
            </h2>

            <p>
              This policy may be updated as ResumeForge
              evolves. The updated version will be
              posted on this page with a revised
              effective date.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <p className="font-semibold">
              Contact information
            </p>

            <p className="mt-1">
              Replace this section with your actual
              support/privacy contact address before
              launching publicly.
            </p>
          </section>

        </div>
      </article>
    </main>
  );
}