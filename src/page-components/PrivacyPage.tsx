'use client';

import Link from 'next/link';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
      <div>
        <Link href="/about" className="text-emerald-400 hover:underline text-sm">
          ← About
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: June 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p>
          Mission Winning (&quot;we&quot;, &quot;us&quot;) operates the Mission Winning app at missionwinning.com.
          This policy explains what we collect, why, and your choices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What we collect</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account:</strong> email address when you sign in (Apple, Google, or magic link).
          </li>
          <li>
            <strong className="text-foreground">Health &amp; fitness data you enter:</strong> workouts, nutrition
            logs, assessments, journey progress, preferences (units, language, goals).
          </li>
          <li>
            <strong className="text-foreground">Device / usage:</strong> basic analytics events (e.g. journey
            milestones) to improve the product.
          </li>
          <li>
            <strong className="text-foreground">Local storage:</strong> much of the free core works offline; data
            may stay on your device until you sign in to sync.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">How we use data</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Provide and personalize your training journey (Today hub, recommendations).</li>
          <li>Sync across devices when signed in (Supabase cloud database).</li>
          <li>Process premium enrollments and support requests.</li>
          <li>Improve the app during private beta (aggregate funnel metrics).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Third parties</h2>
        <p className="text-muted-foreground">
          We use Supabase (hosting/auth/database), Vercel (app hosting), and optionally Resend (transactional
          email), Stripe/PayPal (payments when enabled). Each has its own privacy terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your choices</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Use the free core without an account (local-only).</li>
          <li>Request export from Profile → Data Export.</li>
          <li>Contact us to delete your account and cloud data: support@missionwinning.com</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Not medical advice</h2>
        <p className="text-muted-foreground">
          Mission Winning provides educational fitness tools only. Consult a qualified professional before
          starting new exercise or nutrition programs.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-4">
        Questions: support@missionwinning.com
      </p>
    </div>
  );
}
