import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { STRIPE_LINKS, redirectToCheckout } from "@/lib/stripe";
import { useState } from "react";

export function ProgramsPage() {
  const [filterGoal, setFilterGoal] = useState<string>("All");
  const [filterEquip, setFilterEquip] = useState<string>("All");

  const allPrograms = [
    {
      title: "Elite Personal Training Education + Nutrition",
      price: "$497",
      duration: "Self-paced • ~40 hours core content",
      whatYouGet: [
        "Complete practical curriculum covering assessment, program design, periodization, coaching skills",
        "Integrated nutrition module (macros, client eating psychology, contest prep basics)",
        "50+ ready-to-use templates (strength, hypertrophy, fat loss, corrective)",
        "Business basics: how to actually get and keep clients",
        "Premium unlocks in Mission Winning (advanced programming, nutrition planner)",
        "Certificate of Educational Achievement upon completion review"
      ],
      disclaimer: "This is premium education and skill development. Not a replacement for an accredited certification from an issuing body."
    },
    {
      title: "Bodybuilding Specialist Exercises & Programming",
      price: "$297",
      duration: "Self-paced",
      whatYouGet: [
        "Exercise execution masterclass (hundreds of variations)",
        "Hypertrophy science + application",
        "Specialization techniques, weak point training, posing integration",
        "Full contest prep periodization (offseason → peak week)",
        "Direct templates for the Log app",
        "Nutrition for muscle gain & stage conditioning"
      ],
      disclaimer: "Educational program. We do not issue pro cards or official bodybuilding certifications."
    },
    {
      title: "Corrective Exercise Specialist",
      price: "$347",
      duration: "Self-paced + practical application",
      whatYouGet: [
        "Movement assessment system you can use on day 1",
        "Corrective exercise library mapped to common dysfunctions",
        "How to layer correctives into real strength programs without regression",
        "Case studies and client communication frameworks",
        "Progress tracking inside the Log for you and clients"
      ],
      disclaimer: "This is continuing education for coaches and serious lifters. Not a medical license or physical therapy degree."
    },
    {
      title: "Strength Business of Personal Training",
      price: "$397",
      duration: "Self-paced + templates",
      whatYouGet: [
        "Multiple proven programming systems (5x5, Texas, DUP, block, etc.) with exact progressions",
        "How to sell, price, and deliver online & in-person coaching profitably",
        "Client onboarding, retention, and results systems",
        "Scaling to group programs, online, or your own facility",
        "Premium business features inside Mission Winning"
      ],
      disclaimer: "Business and programming education. Success depends on execution, market, and effort."
    },
    {
      title: "Online Coaching Mastery",
      price: "$297",
      duration: "Self-paced",
      whatYouGet: [
        "How to run high-touch online coaching at scale",
        "Communication systems, check-in protocols, habit coaching",
        "Tech stack recommendations and automation",
        "Ethics, boundaries, and long-term client relationships"
      ],
      disclaimer: "Practical education for coaches. Not legal or medical advice."
    },
    {
      title: "Conditioning Specialist",
      price: "$247",
      duration: "Self-paced",
      whatYouGet: [
        "Energy system development for athletes and general population",
        "Conditioning protocols that complement (not destroy) strength",
        "HWPO-inspired high-volume blocks + recovery management",
        "Test protocols and Log-based conditioning tracking"
      ],
      disclaimer: "Educational content for training professionals and dedicated athletes."
    }
  ];

  // M&S-style filters (goal, equipment, level, duration inspired by muscleandstrength.com workout-routines DB)
  const filteredPrograms = allPrograms.filter((prog) => {
    const goalMatch = filterGoal === "All" ||
      (filterGoal === "Hypertrophy" && prog.title.toLowerCase().includes("bodybuilding")) ||
      (filterGoal === "Corrective" && prog.title.toLowerCase().includes("corrective")) ||
      (filterGoal === "Strength/Business" && (prog.title.toLowerCase().includes("strength") || prog.title.toLowerCase().includes("business") || prog.title.toLowerCase().includes("pt education"))) ||
      (filterGoal === "Conditioning" && prog.title.toLowerCase().includes("conditioning"));
    const equipMatch = filterEquip === "All" ||
      (filterEquip === "Bodyweight/Minimal" && (prog.duration.toLowerCase().includes("self-paced") || prog.whatYouGet.some(w => w.toLowerCase().includes("bodyweight") || w.toLowerCase().includes("minimal")))) ||
      (filterEquip === "Gym/Barbell" && prog.whatYouGet.some(w => w.toLowerCase().includes("barbell") || w.toLowerCase().includes("programming")));
    return goalMatch && equipMatch;
  });

  const exportProgramPDF = (prog: any) => {
    const content = `${prog.title}\n${prog.duration} • ${prog.price}\n\nWhat You Get:\n${prog.whatYouGet.map((w: string) => `- ${w}`).join("\n")}\n\n${prog.disclaimer}\n\nMission Winning Beta Founders • Take Massive Action`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prog.title.replace(/\s+/g, "-")}-MissionWinning-Beta.pdf.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <a href="/" className="text-sm text-emerald-400 hover:underline">← Back to Mission Winning</a>
          <h1 className="text-5xl font-bold tracking-tighter mt-3">THE BETA PROGRAMS</h1>
          <p className="text-xl text-white/70 mt-2">These aren't courses for average people. These are the exact practical weapons winners use to dominate their bodies, their knowledge, and their income. Battle-tested. Designed to be used inside Mission Winning immediately. Apply or stay mediocre.</p>
          <p className="mt-4 text-sm max-w-prose text-white/50">These are <strong>premium practical education programs</strong> for the obsessed. Not certifications. Real skills. Real templates. Real results. The 1% execute. The rest talk. Beta Founders get early bird pricing and input.</p>
          <div className="mt-2 text-emerald-400 font-semibold">347 / 500 BETA FOUNDER SPOTS CLAIMED — EARLY BIRD PRICING ACTIVE</div>
        </div>

        {/* M&S-style filters */}
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <span className="text-white/60 self-center">Filter by Goal:</span>
          {["All", "Hypertrophy", "Corrective", "Strength/Business", "Conditioning"].map(g => (
            <Button key={g} size="sm" variant={filterGoal === g ? "default" : "outline"} onClick={() => setFilterGoal(g)}>{g}</Button>
          ))}
          <span className="text-white/60 self-center ml-4">Equipment:</span>
          {["All", "Bodyweight/Minimal", "Gym/Barbell"].map(e => (
            <Button key={e} size="sm" variant={filterEquip === e ? "default" : "outline"} onClick={() => setFilterEquip(e)}>{e}</Button>
          ))}
          <div className="text-xs text-white/50 self-center ml-auto">Emulating muscleandstrength.com 1000+ plans structure (goal/level/equip/duration filters + summaries)</div>
        </div>

        <div className="space-y-8">
          {filteredPrograms.map((prog, idx) => (
            <Card key={idx} className="bg-[#111827] border-white/10">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl">{prog.title}</CardTitle>
                    <div className="text-emerald-400 mt-1">{prog.duration} • {prog.price} one-time</div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-red-600 hover:bg-red-700 whitespace-nowrap text-base"
                    onClick={() => {
                      // Use Stripe Payment Links (fastest path to real revenue)
                      const linkMap: Record<string, string> = {
                        "Elite Personal Training + Nutrition": STRIPE_LINKS.ptNutrition,
                        "Bodybuilding Specialist Exercises & Programming": STRIPE_LINKS.bodybuilding,
                        "Corrective Exercise Specialist": STRIPE_LINKS.corrective,
                        "Strength Business of Personal Training": STRIPE_LINKS.strengthBusiness,
                        "Online Coaching Mastery": STRIPE_LINKS.onlineCoaching,
                        "Conditioning Specialist": STRIPE_LINKS.conditioning,
                      };
                      const link = linkMap[prog.title] || '';
                      redirectToCheckout(link);
                      // Analytics stub for beta pricing conversion
                      console.log('analytics: beta_program_cta_clicked', prog.title);
                      localStorage.setItem('mw_event_program_' + prog.title.replace(/\s/g,'_'), Date.now().toString());
                      // Extra: "enroll" event for A/B or conversion tracking
                      console.log('analytics: enroll_clicked', prog.title);
                    }}
                  >
                    {Math.random() > 0.5 ? `TAKE MASSIVE ACTION — JOIN BETA FOR ${prog.price} (LIMITED)` : `SECURE YOUR SPOT — ${prog.price} EARLY BIRD`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-8">
                  <div className="md:col-span-3">
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-widest text-white/60">What You Actually Get</h4>
                    <ul className="space-y-2.5">
                      {prog.whatYouGet.map((item, i) => (
                        <li key={i} className="flex gap-3 text-white/90"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-2 bg-black/30 p-5 rounded border border-white/10 text-sm">
                    <div className="font-semibold text-emerald-400 mb-2">IMPORTANT DISCLAIMER</div>
                    {prog.disclaimer}
                    <div className="mt-4 text-xs text-white/50">All sales final. 30-day guarantee for serious buyers only. No refunds for quitters. Questions? Email support@missionwinning.com. This is for winners who take massive action. Beta Founders lock in special pricing. Mission Winning LLC.</div>
                  <div className="mt-3 flex gap-3">
                    <a href="/feedback" className="text-emerald-400 hover:text-emerald-300 text-xs underline">Beta Founders: Share wins &amp; feedback →</a>
                    <Button size="sm" variant="outline" onClick={() => exportProgramPDF(prog)} className="text-xs h-6">Download PDF Summary (M&S style)</Button>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-white/40 max-w-md mx-auto">
          Bundle all programs for significant discount (coming soon). Existing purchasers get notified of updates and new templates.
        </div>
      </div>
    </div>
  );
}
