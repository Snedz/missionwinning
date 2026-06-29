'use client';

import Link from 'next/link';

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
      <div>
        <Link href="/about" className="text-emerald-400 hover:underline text-sm">
          ← About
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4">Terms of Use</h1>
        <p className="text-muted-foreground mt-2">Last updated: June 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Agreement</h2>
        <p className="text-muted-foreground">
          By using Mission Winning, you agree to these terms. If you do not agree, do not use the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Service</h2>
        <p className="text-muted-foreground">
          Mission Winning provides workout tracking, nutrition logging, education content, and optional premium
          programs. The free core is offered at our discretion; premium features may require purchase.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Educational only — not medical advice</h2>
        <p className="text-muted-foreground">
          Content is for general educational purposes. We are not a medical provider or accredited certifying
          agency. Certificates indicate educational achievement only, not professional licensure. You assume
          risk for physical activity; consult a physician before starting new programs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Accounts &amp; acceptable use</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Provide accurate information; keep your email access secure.</li>
          <li>Do not abuse the service, attempt unauthorized access, or scrape premium content.</li>
          <li>Do not use the app for unlawful purposes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Premium &amp; refunds</h2>
        <p className="text-muted-foreground">
          Premium purchases (Super Bundle, specialist programs) are subject to the terms shown at checkout.
          Refund policies will be stated on the sales page; contact support@missionwinning.com for billing
          issues.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Limitation of liability</h2>
        <p className="text-muted-foreground">
          To the fullest extent permitted by law, Mission Winning LLC is not liable for injuries, health
          outcomes, or indirect damages arising from use of the app. The service is provided &quot;as is.&quot;
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changes</h2>
        <p className="text-muted-foreground">
          We may update these terms. Continued use after changes constitutes acceptance. Material changes will
          be noted in the app or via email where appropriate.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-4">
        Mission Winning LLC · support@missionwinning.com · See also{' '}
        <Link href="/privacy" className="text-emerald-400 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
