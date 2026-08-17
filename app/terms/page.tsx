export default function TermsPage() {
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
          Terms of Service
        </h1>

        <p className="mt-4 text-sm text-zinc-400">
          Last updated: August 17, 2026
        </p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-zinc-600">

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              1. Acceptance
            </h2>

            <p>
              By using ResumeForge, you agree to
              these Terms of Service. If you do not
              agree with them, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              2. The service
            </h2>

            <p>
              ResumeForge provides AI-assisted tools
              for creating, editing, formatting, and
              exporting resumes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              3. AI-generated content
            </h2>

            <p>
              AI output may contain mistakes,
              omissions, or wording that does not
              accurately reflect your experience.
              You are responsible for reviewing your
              resume before submitting it to an
              employer or other third party.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              4. Truthfulness
            </h2>

            <p>
              You agree not to knowingly submit false,
              fraudulent, or misleading information
              through the service for the purpose of
              generating professional documents.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              5. Accounts
            </h2>

            <p>
              You are responsible for maintaining the
              security of your account credentials and
              for activity performed through your
              account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              6. Usage limits
            </h2>

            <p>
              Free accounts may be subject to
              generation limits. Anonymous usage may
              also be limited. We may introduce paid
              plans, additional limits, or additional
              features in the future.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              7. Prohibited use
            </h2>

            <p>
              You may not use ResumeForge to abuse the
              service, bypass usage restrictions,
              interfere with security systems, or
              attempt to gain unauthorized access to
              the service or its infrastructure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              8. Availability
            </h2>

            <p>
              The service may be changed, interrupted,
              suspended, or discontinued without
              guaranteeing uninterrupted availability.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              9. Intellectual property
            </h2>

            <p>
              ResumeForge and its branding,
              interface, software, and original
              materials remain the property of their
              respective owners. You retain your rights
              to information you independently provide
              to the service, subject to the rights
              necessary to operate ResumeForge.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              10. Disclaimer
            </h2>

            <p>
              ResumeForge is a productivity and
              writing tool. It does not guarantee
              interviews, employment, compensation,
              hiring decisions, or any particular
              career outcome.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-zinc-900">
              11. Changes to these terms
            </h2>

            <p>
              These terms may be updated as the service
              changes. Continued use after an updated
              version is posted constitutes acceptance
              of the updated terms where applicable.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <p className="font-semibold">
              Before public launch
            </p>

            <p className="mt-1">
              Replace this placeholder with your
              actual business/operator name,
              jurisdiction, and contact information,
              and have the final terms reviewed for
              your intended market.
            </p>
          </section>

        </div>
      </article>
    </main>
  );
}