'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Dumbbell, Flame, Shield, TrendingUp } from "lucide-react";
import { UnlockButton } from "@/components/UnlockButton";
import { MetricsRow } from "@/components/metrics/MetricsRow";
import type { BodyScores } from "@/lib/score";

const DEMO_SCORES: BodyScores = {
  readiness: 82,
  strain: 45,
  recovery: 78,
  readinessLabelKey: 'todayBodyPrimePush',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

export function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('mw_ab_pricing_variant');
    if (!saved) {
      const v = Math.random() > 0.5 ? 'founders' : 'mission';
      localStorage.setItem('mw_ab_pricing_variant', v);
    }
  }, []);

  // Pillars for the Super App (per vision.md - free entry to core, premium depth + Super Bundle for synergy)
  // Repurposed from old education programs as the /learn pillar + others. Core is free.
  const pillars = [
    {
      id: "train",
      title: "Train (Core + Premium Coach)",
      subtitle: "Free tracker + AI-powered personalized plans",
      price: "Free core • Bundle for full",
      desc: "The heart of the mission: free workout tracking, builder, library (bodyweight/global focus). Premium unlocks full Coach with personalized plans, adjustments, and advanced programming — like the best digital trainer, accessible to all.",
      features: ["Free full logger & benchmarks", "Premium: AI plans, 700+ exercises, hybrid options", "Synergizes with all pillars"],
      cta: "Start Free Tracker"
    },
    {
      id: "fuel",
      title: "Fuel (Nutrition)",
      subtitle: "Free basics + premium plans",
      price: "Free core • Bundle for full",
      desc: "Accessible high-protein recipes and logging from elite principles (global ingredients, DASH/Med). Premium: advanced macro coaching, special scenarios, integration with training.",
      features: ["Free recipes & daily tracker", "Premium: deep plans & targets", "Powers every other pillar"],
      cta: "Explore Free Nutrition"
    },
    {
      id: "move",
      title: "Move (Mobility & Yoga)",
      subtitle: "Free flows + premium athletic mobility",
      price: "Free entry • Bundle",
      desc: "Bodyweight mobility and functional movement (free basics). Premium: Pliability-style routines + Skill Yoga for performance, recovery, and longevity.",
      features: ["Free mobility cues & progressions", "Premium: sports-specific + feedback", "Complements training perfectly"],
      cta: "Try Free Move"
    },
    {
      id: "mind",
      title: "Mind (Mindfulness & Recovery)",
      subtitle: "Free habits + premium depth",
      price: "Free core • Bundle",
      desc: "Basic presence and recovery prompts (free for everyone). Premium: Calm/Waking Up-style meditations, sleep tools, and expert lessons on building resilience — the mind pillar that makes the physical path sustainable.",
      features: ["Free breathing & habit tools", "Premium: guided sessions + 'why'", "Boosts consistency across the app"],
      cta: "Start Free Mind Habits"
    }
  ];

  const toolsHighlights = [
    { icon: Dumbbell, label: "FREE Full Workout Logger (Core Mission)", desc: "5x5, linear progression, WOD-style, custom — like StrongLifts & CrossFit. Global, offline PWA. Free forever for everyone." },
    { icon: TrendingUp, label: "1RM & Benchmarks (Free)", desc: "Estimated vs actual, history charts, PR tracking. Metric or lbs. Core for all." },
    { icon: Flame, label: "Premium Pillars + Super Bundle", desc: "Advanced plans, mobility, mind, nutrition depth, education. One bundle for holistic synergy (50% off promos)." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav - Mission focused: Free core + Super Bundle */}
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">MW</div>
            <div>
              <div className="font-semibold tracking-tight">MISSION WINNING</div>
              <div className="text-[10px] text-muted-foreground -mt-1">MISSION WINNING • GLOBAL</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#tools" className="hover:text-emerald-400 transition-colors">FREE CORE</a>
            <a href="#pillars" className="hover:text-emerald-400 transition-colors">PILLARS</a>
            <a href="#bundle" className="hover:text-emerald-400 transition-colors">SUPER BUNDLE</a>
            <Button variant="outline" size="sm" onClick={() => router.push("/log")}>GRAB FREE TRACKER</Button>
            <Button size="sm" variant="fitness" onClick={() => document.getElementById('bundle')?.scrollIntoView({ behavior: 'smooth' })}>GET SUPER BUNDLE</Button>
            <Button variant="ghost" size="sm" className="text-emerald-400" onClick={() => {
              const trig = window.triggerPwaInstall; if (trig) void trig(); else router.push('/log');
            }}>INSTALL FOR OFFLINE (PWA)</Button>
          </div>
        </div>
      </nav>

      {/* Hero — Bevel-style metric preview + Mission Winning messaging */}
      <section className="relative pt-16 pb-20 px-6 border-b border-border/60">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-muted/50 text-sm mb-6 border border-border/60">
              <Shield className="h-4 w-4 text-emerald-500" /> FREE CORE FOR EVERYONE. THE PATH FORWARD.
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              MISSION WINNING.<br />
              <span className="fitness-text-gradient">Train smarter. Recover better.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Core mission — workout tracking, basic tools, accessible recipes — <strong className="text-foreground">100% free for everyone worldwide</strong>. Readiness, strain, and recovery scores built for serious lifters. Premium pillars + Super Bundle for holistic synergy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button size="lg" variant="fitness" className="text-lg px-10 h-14" onClick={() => router.push("/log")}>
                START FREE TRACKER <ArrowRight className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 h-14" onClick={() => document.getElementById('bundle')?.scrollIntoView({ behavior: 'smooth' })}>
                GET SUPER BUNDLE
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free core forever. PWA. Offline. Global. See <a href="/vision" className="underline text-emerald-400">vision.md</a>.</p>
          </div>
          <MetricsRow scores={DEMO_SCORES} demo />
        </div>
      </section>

      {/* Problem Agitation - Cardone Style: Hit them hard */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-b border-border/60">
        <div className="text-center mb-10">
          <div className="uppercase tracking-[3px] text-red-500 text-sm font-medium mb-3">THE TRUTH NO ONE TELLS YOU</div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">You're Average Because You're Playing Small.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 text-lg text-muted-foreground">
          <div>
            <p className="mb-4">Most people drag through life with weak bodies, low energy, and zero discipline. They "try" the gym for 3 weeks then quit. They follow random YouTube videos and wonder why nothing changes.</p>
            <p>That's not you. Or it won't be. Because average is a choice — and you're done choosing it.</p>
          </div>
          <div>
            <p className="mb-4">The top performers? They don't mess around. They use systems. They take massive action. They dominate their space. They invest in real knowledge and tools that actually move the needle — and they do it now, before the window closes.</p>
            <p>Mission Winning is built for everyone. Free core tools for the global mission. The Super Bundle for those who want the full synergistic path to better health.</p>
          </div>
        </div>
        <div className="mt-8 text-center text-red-400 font-bold">The free core is here for all. The Super Bundle makes the full path accessible and sustainable.</div>
      </section>

      {/* Problem + Solution - Cardone Agitation & Proof */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-b border-border/60">
        <div className="text-center mb-10">
          <div className="uppercase tracking-[3px] text-red-500 text-sm font-medium mb-3">THE MASSIVE ACTION DIFFERENCE</div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Most "Fitness Apps" Are For Losers Who Want To Feel Busy.</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/70">Mission Winning is different. Free core tools so anyone, anywhere can start the path. Premium pillars and the Super Bundle for deeper transformation and to sustain the mission for all.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-sm leading-relaxed max-w-3xl mx-auto">
          <div className="font-semibold mb-3 text-emerald-400">OUR PROMISE TO THE OBSESSED</div>
          Every single program and tool in Mission Winning is engineered so you apply it immediately inside the tracker. No fluff. No theory. Just massive action and measurable elite results. Winners don't read books and hope. They execute.
        </div>
      </section>

      {/* Free Tools Hook - Cardone Lead Magnet */}
      <section id="tools" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-emerald-500 uppercase tracking-widest text-xs mb-2">100% FREE. NO EXCUSES. NO LIMITS.</div>
          <h2 className="text-4xl font-bold tracking-tight">The Free Tracker That Separates The 1% From Everyone Else.</h2>
          <p className="mt-3 text-white/60 max-w-md mx-auto">Real tools. Real progress. The same systems the winners use — free so you can feel the power before you go all-in on the Beta Founders programs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {toolsHighlights.map((t, i) => (
            <Card key={i} className="bg-card border-border/60 hover:border-emerald-500/30 transition-colors">
              <CardHeader>
                <t.icon className="h-8 w-8 text-emerald-500 mb-3" />
                <CardTitle>{t.label}</CardTitle>
                <CardDescription className="text-muted-foreground">{t.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 h-14" onClick={() => router.push("/log")}>
            GRAB THE FREE TRACKER NOW — START MASSIVE ACTION TODAY <ArrowRight className="ml-2" />
          </Button>
          <div className="text-xs mt-3 text-white/40">Used by serious lifters worldwide. 5x5 • Texas Method • Custom Builder • History • PR Tracking • PWA • Global</div>
          <Button size="sm" variant="outline" className="mt-3 border-emerald-400 text-emerald-400" onClick={() => {
            // Use captured beforeinstallprompt if available (from main.tsx)
            const promptEvt = window.deferredPwaPrompt?.();
            if (promptEvt?.prompt) {
              void promptEvt.prompt().then(() => { console.log('analytics: pwa_prompt_used'); });
            } else if ('serviceWorker' in navigator) {
              alert("Add to Home Screen from browser menu (Chrome: ⋮ > Install Mission Winning). Full offline PWA ready — train anywhere. No excuses.");
            } else {
              window.location.href = "/log";
            }
            // Analytics stub
            console.log('analytics: pwa_install_clicked');
            localStorage.setItem('mw_event_pwa', Date.now().toString());
          }}>INSTALL MISSION WINNING (PWA • OFFLINE • FREE)</Button>
        </div>
      </section>

      {/* BETA PROGRAMS - HIGH TICKET CARDONE CLOSES */}
      <section id="programs" className="bg-muted/20 py-16 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-emerald-400 uppercase tracking-[3px] text-sm mb-2">THE PILLARS — FREE FOR ALL + SUPER BUNDLE SYNERGY</div>
            <h2 className="text-4xl font-bold tracking-tight">The Right Path, Accessible to Everyone.</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">Free core in every pillar (per vision.md). Premium depth and the Super Bundle (6 pillars, one subscription, 50% off intro like the best holistic models) for full transformation and the mission's sustainability.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((p) => (
              <Card key={p.id} className="bg-card border-border/60 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{p.title}</CardTitle>
                      <CardDescription className="text-emerald-400/80 mt-1">{p.subtitle}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold tabular-nums">{p.price}</div>
                      <div className="text-xs text-white/50">FREE ENTRY. BUNDLE FOR FULL PATH.</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-6">{p.desc}</p>
                  <ul className="space-y-2 mb-8 text-sm">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5" /> {f}</li>
                    ))}
                  </ul>
                  <div className="mb-3 text-xs text-emerald-400 font-semibold">FREE CORE FOR EVERYONE. Super Bundle for the full synergistic path (50% off intro promos — like proven holistic models). See vision.md.</div>
                  <UnlockButton
                    productId={p.id}
                    className="mt-auto"
                  />
                  <div className="text-[10px] text-center mt-3 text-white/40">Free basics always. Premium unlocks + bundle synergies • 30-day guarantee • Powered by PayPal</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs mt-8 text-white/50 max-w-lg mx-auto">
            The pillars are <strong>accessible to all</strong>. Free entry + useful tools for the mission of global health. Premium depth and the Super Bundle for those who want the complete, synergistic path. Not gated elite content — the right way, for everyone.
          </p>
          <div className="text-center mt-6">
            <a href="/bundle" className="inline-block text-emerald-400 hover:text-emerald-300 text-sm underline">Explore the Super Bundle →</a>
          </div>

          {/* Early Users / Social Proof - updated for new model */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="text-emerald-400 uppercase tracking-[3px] text-sm mb-2">EARLY USERS OF THE PATH</div>
            <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
              {(() => {
                try {
                  const fb = JSON.parse(localStorage.getItem('mw_beta_feedback') || '[]');
                  if (fb.length > 0) {
                    return fb.slice(0,2).map((f: { testimonial?: string; results?: string; rating?: number }, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded border border-white/10">
                        “{f.testimonial || f.results}” <span className="text-emerald-400 text-xs">— Early user, {f.rating}/5 results</span>
                      </div>
                    ));
                  }
                } catch {
                  /* invalid beta feedback */
                }
                return [
                  <div key="d1" className="bg-white/5 p-3 rounded border border-white/10">“The free tracker got me consistent. The bundle unlocked the full synergy — mobility + mind + nutrition transformed my training.” <span className="text-emerald-400 text-xs">— A. R., rating 5</span></div>,
                  <div key="d2" className="bg-white/5 p-3 rounded border border-white/10">“Free core for my whole family. Bundle for me. Finally the everything app that actually works globally.” <span className="text-emerald-400 text-xs">— J. K., rating 5</span></div>
                ];
              })()}
            </div>
            <div className="text-xs text-white/50 mt-2">Real feedback from early users of the free core + Super Bundle. Your results can be next.</div>
          </div>
        </div>
      </section>

      {/* ELITE COACHING - CARDONE HIGH TICKET */}
      <section id="coaching" className="max-w-4xl mx-auto px-6 py-16 text-center border-b border-white/10">
        <div className="uppercase text-red-500 tracking-widest text-sm mb-2">FOR THE OBSESSED ONLY</div>
        <h2 className="text-4xl font-bold tracking-tight mb-4">1-on-1 Elite Coaching. Limited. Expensive. Life-Changing.</h2>
        <p className="text-white/70 max-w-md mx-auto mb-8">Work directly with the best. Full programming. Nutrition. Weekly reviews. Direct access. This is what the obsessed pay for to dominate their results faster than anyone else. Application only. No tire-kickers. Beta cohort gets early access.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left max-w-3xl mx-auto">
          {[
            { title: "Monthly Elite Coaching", price: "$997/mo", desc: "Full programming + nutrition + weekly video reviews. Direct access." },
            { title: "90-Day Transformation", price: "$2,497", desc: "Intensive block. Pre/post assessments. Full premium Mission Winning access. Results or we work for free." },
            { title: "Coach Mentorship", price: "Custom", desc: "For trainers ready to build their own empire using the exact Mission Winning systems." }
          ].map((c, i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle>{c.title}</CardTitle>
                <div className="text-2xl font-semibold text-emerald-400">{c.price}</div>
              </CardHeader>
              <CardContent className="text-sm text-white/70">{c.desc}</CardContent>
            </Card>
          ))}
        </div>

        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-10 h-14" onClick={() => router.push("/coaching")}>APPLY FOR ELITE COACHING — ONLY THE OBSESSED</Button>
        <div className="text-xs mt-3 text-white/40">Spots are extremely limited. We only work with people who are obsessed. Apply now or stay average.</div>
      </section>

      {/* FINAL URGENCY / MASSIVE ACTION CLOSE - CARDONE STYLE */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="text-red-500 text-sm tracking-[3px] mb-2">THE CLOCK IS TICKING</div>
        <h2 className="text-4xl font-bold tracking-tight mb-4">You Have Two Choices.</h2>
        <p className="text-xl text-white/80 mb-8">Keep doing what you've always done and stay average. Or take massive action and dominate your effort, your body, and your results with Mission Winning Beta starting right now.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 h-14" onClick={() => router.push("/log")}>
            START FREE — PROVE IT TO YOURSELF
          </Button>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-10 h-14" onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}>
            JOIN BETA — TAKE MASSIVE ACTION NOW
          </Button>
        </div>
        <p className="mt-6 text-sm text-white/50">Winners use Mission Winning. Losers make excuses. Which one are you?</p>
      </section>

      {/* Trust / Disclaimers - Cardone Direct */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-sm text-white/60">
        <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center mb-6 text-xs uppercase tracking-widest">
          <div>MASSIVE ACTION ONLY</div>
          <div>BUILT FOR REAL WINNERS</div>
          <div>GLOBAL. NO EXCUSES.</div>
          <div>RESULTS OR NOTHING</div>
        </div>
        <p className="text-center leading-relaxed">
          <strong>Listen up:</strong> Mission Winning is for people who actually want to win. This is elite practical education and tools — not a magic pill. We are not a certifying agency. You get a Mission Winning Certificate of Educational Achievement. Results require massive action on your part. Consult doctors. Don't be stupid. This is education, not medical advice. Winners take responsibility. Average people blame the system. The operating company is a for-profit entity; a separate nonprofit foundation may support free global access and scholarships.
        </p>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-white/40">
        © Mission Winning • Dominate Your Health. Build an Unstoppable Life. • <a href="#programs" className="hover:text-white/70">BETA PROGRAMS</a> • <a href="/log" className="hover:text-white/70">FREE TRACKER</a> • <a href="/about" className="hover:text-white/70">ABOUT</a>
      </footer>
    </div>
  );
}
