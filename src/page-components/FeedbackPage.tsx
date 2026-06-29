'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLead } from "@/lib/supabase";

export function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    results: "",
    testimonial: "",
    rating: "5",
    massiveAction: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const entry = { ...form, at: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("mw_beta_feedback") || "[]");
    localStorage.setItem("mw_beta_feedback", JSON.stringify([...existing, entry]));
    await submitLead({
      name: form.name || "Beta Contributor",
      email: form.email,
      goals: `Results: ${form.results}\nTestimonial: ${form.testimonial}\nRating: ${form.rating}\nMassive action: ${form.massiveAction}`,
      package_interest: "beta-feedback",
      source: "feedback-page",
      message: form.testimonial,
    });
    localStorage.setItem("mw_beta_contributor", "true");
    localStorage.setItem('mw_event_feedback', Date.now().toString());
    const claimed = parseInt(localStorage.getItem('mw_beta_spots_claimed') || '347');
    localStorage.setItem('mw_beta_spots_claimed', Math.min(500, claimed + 1).toString());
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-sm mb-4 border border-emerald-500/30">
          MISSION BUILDERS
        </div>
        <h1 className="text-5xl font-bold tracking-tighter mb-4">Thank You.</h1>
        <p className="text-xl text-white/70 mb-8">
          Your action + feedback helps make the free core and Super Bundle better for the global mission. 
          Your voice counts.
        </p>
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-8 text-left max-w-md mx-auto">
          <div className="uppercase tracking-[3px] text-emerald-400 text-xs mb-2">YOUR CONTRIBUTOR STATUS</div>
          <div className="font-semibold">✓ Super Bundle premium unlocks</div>
          <div className="font-semibold">✓ Input on roadmap + features</div>
          <div className="font-semibold">✓ Early access to updates</div>
          <div className="mt-4 text-xs text-white/50">Watch your email for updates + community drops.</div>
        </div>
        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = "/log"}>
          BACK TO THE LOG — KEEP BUILDING THE PATH
        </Button>
        <div className="mt-6 text-xs text-white/40">You don't just consume. You help build a healthier world for all.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-sm text-emerald-400 hover:underline">← Back to Mission Winning</a>

        <div className="mt-6 mb-10">
          <div className="uppercase tracking-[3px] text-red-500 text-sm mb-2">MISSION BUILDERS — YOUR VOICE MATTERS</div>
          <h1 className="text-5xl font-bold tracking-tighter">Shape Mission Winning. Share Your Wins.</h1>
          <p className="mt-3 text-xl text-white/70 max-w-2xl">
            You took massive action and joined early. Now tell us what results you're seeing, what worked, what to build next. 
            Your input becomes the proof that helps the next 5000 winners dominate.
          </p>
          <div className="mt-2 text-xs text-emerald-400">Limited to Beta Founders. This is how the obsessed build the future.</div>
        </div>

        <Card className="bg-[#111827] border-white/10">
          <CardHeader>
            <CardTitle>Beta Founders Feedback + Results</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name (optional)</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Rivera" />
                </div>
                <div>
                  <Label>Email (for follow-up)</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@winning.com" required />
                </div>
              </div>

              <div>
                <Label>Key Results So Far (PRs, body comp, energy, business wins — be specific)</Label>
                <textarea
                  className="w-full h-24 bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40"
                  value={form.results}
                  onChange={e => setForm({ ...form, results: e.target.value })}
                  placeholder="Added 25kg to squat in 6 weeks. Energy through the roof. Finally consistent with nutrition. Down 8lbs fat while holding strength."
                  required
                />
              </div>

              <div>
                <Label>Your Testimonial (what would you tell another obsessed person considering Mission Winning Beta?)</Label>
                <textarea
                  className="w-full h-28 bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40"
                  value={form.testimonial}
                  onChange={e => setForm({ ...form, testimonial: e.target.value })}
                  placeholder="Stop waiting. The free tracker alone got me consistent. The Beta programs gave me the exact systems I was missing. Best investment I've made in myself in years."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Rate Your Results (1-5)</Label>
                  <div className="flex gap-2 mt-2">
                    {["1","2","3","4","5"].map(r => (
                      <Button key={r} type="button" variant={form.rating === r ? "default" : "outline"} onClick={() => setForm({ ...form, rating: r })}>{r}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Biggest "Massive Action" You Took Because of Mission Winning</Label>
                  <Input value={form.massiveAction} onChange={e => setForm({ ...form, massiveAction: e.target.value })} placeholder="Finally ran the 5x5 program start to finish. No excuses." />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-red-600 hover:bg-red-700 text-lg py-6" disabled={loading}>
                {loading ? "Submitting..." : "SUBMIT — HELP BUILD THE SYSTEM FOR THE NEXT WINNERS"}
              </Button>
              <p className="text-[10px] text-center text-white/40">30 seconds. Your words may be featured (anonymized or with permission). This is how Beta Founders create the proof.</p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-10 text-center text-xs text-white/50 max-w-md mx-auto">
          Thank you for being one of the first. Winners take massive action and then tell the truth about what worked. That's how movements are built.
        </div>

        {/* Sign up / Sign in for early private access + cloud while building privately */}
        <div className="mt-6 p-4 bg-[#111827] border border-emerald-500/30 rounded">
          <div className="text-emerald-400 font-medium mb-2">Sign up / Sign in for early private access + cloud sync (free magic link)</div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            if (!email) return;
            try {
              const { signInMagic } = await import('@/lib/supabase');
              await signInMagic(email);
              alert(`Magic link sent to ${email}. Check email to access the full private build.`);
            } catch (err: any) {
              alert('Error: ' + (err.message || 'Check Supabase/Resend in Vercel.'));
            }
          }} className="flex gap-2">
            <input name="email" type="email" placeholder="you@email.com" className="flex-1 border border-white/20 bg-black/40 rounded px-3 py-2 text-sm" required />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium">Send Magic Link</button>
          </form>
          <div className="text-[10px] text-white/40 mt-1">Public teaser only. Sign in for full access + to track your contributor impact in the private build.</div>
        </div>
      </div>
    </div>
  );
}
