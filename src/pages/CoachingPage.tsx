import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-sm text-emerald-400 hover:underline">← Back to Mission Winning</a>

        <h1 className="text-5xl font-bold tracking-tighter mt-6">ELITE COACHING. APPLICATION ONLY.</h1>
        <p className="text-2xl text-white/70 mt-2">1-on-1 with coaches who actually live the system. For the obsessed who want results faster than humanly possible on their own. Limited spots. No average people allowed. Beta cohort gets early access perks.</p>

        <div className="my-10 grid gap-6">
          <Card className="bg-[#111827] border-white/10">
            <CardHeader>
              <CardTitle>Monthly Elite Coaching — $997/mo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <p>Full custom programming (strength + conditioning), nutrition periodization, weekly video or written check-ins, form review, and full premium access to Mission Winning for you (and your clients if you're a coach). This is how the obsessed dominate their results.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Unlimited adjustments</li>
                <li>Direct access to your coach</li>
                <li>Log premium + custom blocks from our education library</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-white/10">
            <CardHeader>
              <CardTitle>90-Day Elite Transformation — $2,497</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <p>Intensive block for people who want massive results now. Includes everything in monthly + pre/post assessments, photo/video form checks, and a full results debrief. Results or we keep working.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-white/10">
            <CardHeader>
              <CardTitle>Coach Mentorship &amp; Business Accelerator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-3">For trainers ready to build their own empire. We help you build your own roster using the exact systems from the Strength Business course. Custom pricing. This is how you go from coach to 7-figure business owner.</p>
              <div className="text-sm text-white/60">Includes co-programming support, client acquisition playbooks, and access to our private coach community (when launched).</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <h3 className="font-semibold mb-4">Ready to apply?</h3>
          <p className="text-white/70 mb-6">Coaching is for the obsessed only. We don't work with people who "try." We work with winners who take massive action. Fill out the form below (or email hello@missionwinning.com with your goals, current training, and why you're ready to stop being average). Beta cohort gets priority.</p>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Application received (MVP simulation). In real version this submits to backend and creates a lead in the system. Stripe invoice sent after review."); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required className="bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40" placeholder="Full Name" />
              <input required type="email" className="bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40" placeholder="Email" />
            </div>
            <textarea required className="w-full h-32 bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40" placeholder="Tell us about your goals, current training, and why Mission Winning coaching is the right fit right now..." />
            <Button type="submit" size="lg" className="w-full bg-red-600 hover:bg-red-700">SUBMIT APPLICATION — ONLY FOR THE OBSESSED (BETA COHORT OPEN)</Button>
          </form>
          <p className="text-[10px] text-center text-white/40 mt-4">We reply within 48 hours. Spots are limited.</p>
          <div className="text-center mt-4"><a href="/feedback" className="text-emerald-400 hover:underline text-sm">Beta cohort: Share your transformation wins →</a></div>
        </div>

        <div className="mt-10 text-xs text-white/40 text-center max-w-prose mx-auto">
          Coaching is education and accountability. Results are not guaranteed and depend on your consistency, genetics, and life circumstances. Always clear new training/nutrition plans with your physician.
        </div>
      </div>
    </div>
  );
}
