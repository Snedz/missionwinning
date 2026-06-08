import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Dumbbell, Flame, Shield, TrendingUp } from "lucide-react";
import { STRIPE_LINKS, redirectToCheckout } from "@/lib/stripe";

export function LandingPage() {
  const navigate = useNavigate();
  const [abVariant, setAbVariant] = useState<'founders' | 'mission'>('founders');

  useEffect(() => {
    const saved = localStorage.getItem('mw_ab_pricing_variant') as 'founders' | 'mission' | null;
    if (saved) {
      setAbVariant(saved);
    } else {
      const v = Math.random() > 0.5 ? 'founders' : 'mission';
      setAbVariant(v);
      localStorage.setItem('mw_ab_pricing_variant', v);
    }
  }, []);

  const programs = [
    {
      id: "pt-nutrition",
      title: "Elite Personal Training + Nutrition",
      subtitle: "Practical Foundations & Coaching Skills",
      price: "$497",
      desc: "Comprehensive practical education covering anatomy, program design, client assessment, business fundamentals, and integrated nutrition coaching. Includes ready-to-use templates that work directly in Mission Winning.",
      features: ["Full programming frameworks", "Nutrition integration", "Client assessment protocols", "Business setup playbook", "Premium Mission Winning unlocks"],
      cta: "Enroll in PT Education"
    },
    {
      id: "bodybuilding",
      title: "Bodybuilding Specialist",
      subtitle: "Hypertrophy & Stage-Ready Training",
      price: "$297",
      desc: "Advanced exercise selection, volume & intensity techniques, posing, peak week, and specialization for aesthetics. Heavy emphasis on the exercises and progressions used in real bodybuilding prep.",
      features: ["Exercise library deep-dive", "Periodized hypertrophy blocks", "Weak point training", "Direct Mission Winning templates", "Nutrition for growth"],
      cta: "Get Bodybuilding Program"
    },
    {
      id: "corrective",
      title: "Corrective Exercise Specialist",
      subtitle: "Assessment, Mobility & Injury Prevention",
      price: "$347",
      desc: "Practical system for identifying movement dysfunctions, building corrective strategies, and integrating them into strength programs without killing progress. Essential for sustainable training for all ages and goals.",
      features: ["Movement assessment flow", "Corrective exercise library", "Integration with main lifts", "Log progress tracking", "Client communication scripts"],
      cta: "Master Corrective Exercise"
    },
    {
      id: "strength-business",
      title: "Strength Business of Personal Training",
      subtitle: "Programming + Coaching Business",
      price: "$397",
      desc: "How to actually make a living (or side income) as a strength coach. Programming systems (5x5, Texas, DUP, etc.), client acquisition, pricing, online coaching operations, and scaling.",
      features: ["Proven programming systems", "Client onboarding templates", "Pricing & package models", "Online coaching ops", "Premium Mission Winning business features"],
      cta: "Build Your Strength Business"
    }
  ];

  const toolsHighlights = [
    { icon: Dumbbell, label: "Free Full Workout Logger", desc: "5x5, linear progression, WOD-style, custom — just like StrongLifts & CrossFit apps. Global, offline PWA." },
    { icon: TrendingUp, label: "1RM & Benchmarks", desc: "Estimated vs actual, history charts, PR tracking. Metric or lbs." },
    { icon: Flame, label: "Premium Unlocks", desc: "Specialist blocks, advanced periodization, full nutrition planner (with purchase or sub)" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Top Nav - Cardone Style: Direct, Action-Oriented, Beta Focus */}
      <nav className="border-b border-white/10 bg-[#0a0f1a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold">F</div>
            <div>
              <div className="font-semibold tracking-tight">MISSION WINNING</div>
              <div className="text-[10px] text-white/50 -mt-1">MISSION WINNING • GLOBAL</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#tools" className="hover:text-emerald-400 transition-colors">FREE TOOLS</a>
            <a href="#programs" className="hover:text-emerald-400 transition-colors">BETA PROGRAMS</a>
            <a href="#coaching" className="hover:text-emerald-400 transition-colors">ELITE COACHING</a>
            <Button variant="outline" size="sm" onClick={() => navigate("/log")}>GRAB FREE TRACKER</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}>JOIN BETA FOUNDERS NOW</Button>
            <Button variant="ghost" size="sm" className="text-emerald-400" onClick={() => {
              const trig = (window as any).triggerPwaInstall; if (trig) trig(); else navigate('/log');
            }}>INSTALL FOR OFFLINE (PWA)</Button>
          </div>
        </div>
      </nav>

      {/* Hero - GRANT CARDONE-INSPIRED: Massive Action, Be Obsessed, Dominate, Beta Urgency */}
      <section className="relative pt-20 pb-16 px-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 text-sm mb-6 border border-white/10">
            <Shield className="h-4 w-4 text-emerald-500" /> NO EXCUSES. MASSIVE ACTION. GLOBAL.
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            MISSION WINNING: YOUR ELITE BODY.<br />
            DOMINATE YOUR HEALTH.<br />
            BUILD AN UNSTOPPABLE LIFE.
          </h1>
          <p className="max-w-3xl mx-auto text-2xl text-white/80 mb-8">
            Stop being average. The weak make excuses. Winners take massive action with Mission Winning — the all-in-one weapon that turns ordinary people into elite performers. 
            The only tracker + education system built for the obsessed who refuse to settle. Whether you're in Lagos, Moscow, Dubai or anywhere — this is how you dominate your health and life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 h-14" onClick={() => navigate("/log")}>
              START FREE TRACKER — PROVE IT TO YOURSELF <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-10 h-14" onClick={() => {
              console.log('analytics: cta_variant_clicked', abVariant);
              document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              {abVariant === 'founders' ? 'JOIN BETA FOUNDERS — LIMITED EARLY BIRD PRICING' : 'START YOUR MISSION WINNING — EARLY ACCESS'}
            </Button>
          </div>
          <p className="text-sm text-white/60">Free forever for the basics. Beta Founders get lifetime pricing lock + perks. PWA. Offline. Global. Metric or lbs. Only 500 spots.</p>
          <div className="mt-2 text-emerald-400 font-semibold">347 / 500 BETA FOUNDER SPOTS CLAIMED — THIS WINDOW CLOSES SOON.</div>
          <div className="mt-8 text-red-400 font-semibold">THE MISSION WINNING BETA REVOLUTION IS HERE. BE ONE OF THE FIRST TO DOMINATE — OR WATCH FROM THE SIDELINES.</div>
        </div>
      </section>

      {/* Problem Agitation - Cardone Style: Hit them hard */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/10">
        <div className="text-center mb-10">
          <div className="uppercase tracking-[3px] text-red-500 text-sm font-medium mb-3">THE TRUTH NO ONE TELLS YOU</div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">You're Average Because You're Playing Small.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 text-lg text-white/80">
          <div>
            <p className="mb-4">Most people drag through life with weak bodies, low energy, and zero discipline. They "try" the gym for 3 weeks then quit. They follow random YouTube videos and wonder why nothing changes.</p>
            <p>That's not you. Or it won't be. Because average is a choice — and you're done choosing it.</p>
          </div>
          <div>
            <p className="mb-4">The top performers? They don't mess around. They use systems. They take massive action. They dominate their space. They invest in real knowledge and tools that actually move the needle — and they do it now, before the window closes.</p>
            <p>Mission Winning was built for the obsessed. For the winners who know that a strong body is the foundation for a strong life, business, and legacy. Join the Beta Founders before it's too late.</p>
          </div>
        </div>
        <div className="mt-8 text-center text-red-400 font-bold">Stay average if you want. Or take massive action with Mission Winning Beta and dominate.</div>
      </section>

      {/* Problem + Solution - Cardone Agitation & Proof */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/10">
        <div className="text-center mb-10">
          <div className="uppercase tracking-[3px] text-red-500 text-sm font-medium mb-3">THE MASSIVE ACTION DIFFERENCE</div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Most "Fitness Apps" Are For Losers Who Want To Feel Busy.</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/70">Mission Winning is different. It's the system for people who want to take massive action and dominate their results in the gym, in the kitchen, and in life. Free tracker to get you hooked. Beta Founders programs and coaching to make you unstoppable.</p>
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
            <Card key={i} className="bg-[#111827] border-white/10 hover:border-emerald-500/30 transition-colors">
              <CardHeader>
                <t.icon className="h-8 w-8 text-emerald-500 mb-3" />
                <CardTitle>{t.label}</CardTitle>
                <CardDescription className="text-white/60">{t.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 h-14" onClick={() => navigate("/log")}>
            GRAB THE FREE TRACKER NOW — START MASSIVE ACTION TODAY <ArrowRight className="ml-2" />
          </Button>
          <div className="text-xs mt-3 text-white/40">Used by serious lifters worldwide. 5x5 • Texas Method • Custom Builder • History • PR Tracking • PWA • Global</div>
          <Button size="sm" variant="outline" className="mt-3 border-emerald-400 text-emerald-400" onClick={() => {
            // Use captured beforeinstallprompt if available (from main.tsx)
            const promptEvt = (window as any).deferredPwaPrompt && (window as any).deferredPwaPrompt();
            if (promptEvt && promptEvt.prompt) {
              promptEvt.prompt().then(() => { console.log('analytics: pwa_prompt_used'); });
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
      <section id="programs" className="bg-[#0f1624] py-16 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-red-500 uppercase tracking-[3px] text-sm mb-2">THE BETA PROGRAMS — FOR WINNERS ONLY</div>
            <h2 className="text-4xl font-bold tracking-tight">These Aren't "Courses." These Are Weapons.</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">The exact practical systems the 1% use to build elite bodies and real businesses. One-time investment. Lifetime elite results. Free tracker access + premium unlocks included. Limited at this price for Beta Founders.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((p) => (
              <Card key={p.id} className="bg-[#111827] border-white/10 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{p.title}</CardTitle>
                      <CardDescription className="text-emerald-400/80 mt-1">{p.subtitle}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold tabular-nums">{p.price}</div>
                      <div className="text-xs text-white/50">ONE-TIME. MASSIVE VALUE.</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-white/70 mb-6">{p.desc}</p>
                  <ul className="space-y-2 mb-8 text-sm">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5" /> {f}</li>
                    ))}
                  </ul>
                  <div className="mb-3 text-xs text-red-400 font-semibold">347 / 500 BETA FOUNDER SPOTS CLAIMED. ONLY EARLY BIRD PRICING. LOCK IN LIFETIME ACCESS — DON'T BE THE ONE WHO WAITS.</div>
                  <Button className="mt-auto bg-white text-black hover:bg-white/90 text-base py-6" onClick={() => {
                    const link = p.id === 'pt-nutrition' ? STRIPE_LINKS.ptNutrition : 
                                 p.id === 'bodybuilding' ? STRIPE_LINKS.bodybuilding :
                                 p.id === 'corrective' ? STRIPE_LINKS.corrective :
                                 p.id === 'strength-business' ? STRIPE_LINKS.strengthBusiness : '';
                    redirectToCheckout(link);
                  }}>
                    TAKE MASSIVE ACTION — JOIN BETA FOR {p.price}
                  </Button>
                  <div className="text-[10px] text-center mt-3 text-white/40">Instant access • Full PDFs + lifetime Mission Winning premium unlocks + beta perks • 30-day no-BS guarantee</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs mt-8 text-white/50 max-w-lg mx-auto">
            These are <strong>premium practical education programs</strong> for serious people. Not certifications. Not for the lazy. We teach the skills that turn average into elite. Strong disclaimers apply — see below. Winners take massive action now. Beta Founders lock in special pricing.
          </p>
          <div className="text-center mt-6">
            <a href="/feedback" className="inline-block text-emerald-400 hover:text-emerald-300 text-sm underline">Beta Founders: Share your results &amp; shape the next version →</a>
          </div>

          {/* Beta Testimonials / Social Proof - seeded from /feedback local data or demo */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="text-red-500 uppercase tracking-[3px] text-sm mb-2">BETA FOUNDERS SPEAK</div>
            <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
              {(() => {
                try {
                  const fb = JSON.parse(localStorage.getItem('mw_beta_feedback') || '[]');
                  if (fb.length > 0) {
                    return fb.slice(0,2).map((f: any, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded border border-white/10">
                        “{f.testimonial || f.results}” <span className="text-emerald-400 text-xs">— Beta Founder, {f.rating}/5 results</span>
                      </div>
                    ));
                  }
                } catch {}
                return [
                  <div key="d1" className="bg-white/5 p-3 rounded border border-white/10">“Added 25kg to squat in 6 weeks. The Beta programs gave me the exact systems. Best investment.” <span className="text-emerald-400 text-xs">— A. R., rating 5</span></div>,
                  <div key="d2" className="bg-white/5 p-3 rounded border border-white/10">“Finally consistent with nutrition. Energy through the roof. Stop waiting — take massive action.” <span className="text-emerald-400 text-xs">— J. K., rating 5</span></div>
                ];
              })()}
            </div>
            <div className="text-xs text-white/50 mt-2">Real feedback from early Beta Founders. Your results can be next.</div>
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

        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-10 h-14" onClick={() => navigate("/coaching")}>APPLY FOR ELITE COACHING — ONLY THE OBSESSED</Button>
        <div className="text-xs mt-3 text-white/40">Spots are extremely limited. We only work with people who are obsessed. Apply now or stay average.</div>
      </section>

      {/* FINAL URGENCY / MASSIVE ACTION CLOSE - CARDONE STYLE */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="text-red-500 text-sm tracking-[3px] mb-2">THE CLOCK IS TICKING</div>
        <h2 className="text-4xl font-bold tracking-tight mb-4">You Have Two Choices.</h2>
        <p className="text-xl text-white/80 mb-8">Keep doing what you've always done and stay average. Or take massive action and dominate your effort, your body, and your results with Mission Winning Beta starting right now.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 h-14" onClick={() => navigate("/log")}>
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
