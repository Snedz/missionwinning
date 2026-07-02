'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { UnlockButton } from "@/components/UnlockButton";
import { useState } from "react";

export function ProgramsPage() {
  // Transitioned per vision.md: This is legacy marketing for the Learn pillar (/learn).
  // Core is free (tracker + basics). Premium education + full pillars via Super Bundle (50% off promos).
  // See /bundle, /learn, and vision.md for the free global everything-health model.
  const [filterGoal, setFilterGoal] = useState<string>("All");
  const [filterEquip, setFilterEquip] = useState<string>("All");

  type LegacyProgram = {
    title: string;
    price: string;
    duration: string;
    whatYouGet: string[];
    disclaimer: string;
  };

  const allPrograms: LegacyProgram[] = [
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

  const exportProgramPDF = (prog: LegacyProgram) => {
    const content = `${prog.title}\n${prog.duration} • ${prog.price}\n\nWhat You Get:\n${prog.whatYouGet.map((w: string) => `- ${w}`).join("\n")}\n\n${prog.disclaimer}\n\nMission Winning — Free Core + Super Bundle. The path for all.`;
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
          <h1 className="text-5xl font-bold tracking-tighter mt-3">THE LEARN PILLAR</h1>
          <p className="text-xl text-white/70 mt-2">Premium practical education as part of the Super Bundle. Free core tools and intros for everyone worldwide. Full programs unlock deeper mastery for bundle members. Designed to be used inside the app immediately. The free path is always open.</p>
          <p className="mt-4 text-sm max-w-prose text-white/50">These are <strong>premium practical education programs</strong> for those ready for more. Not certifications. Real skills. Real templates. Real results. Free core for the mission; bundle sustains it for all.</p>
          <div className="mt-2 text-emerald-400 font-semibold">Join the Super Bundle to unlock full access + help shape the future.</div>
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
                  <UnlockButton
                    productId={
                      prog.title.toLowerCase().includes('personal') ? 'pt-nutrition' :
                      prog.title.toLowerCase().includes('bodybuilding') ? 'bodybuilding' :
                      prog.title.toLowerCase().includes('corrective') ? 'corrective' :
                      prog.title.toLowerCase().includes('business') ? 'strength-business' :
                      prog.title.toLowerCase().includes('coaching') ? 'online-coaching' :
                      prog.title.toLowerCase().includes('conditioning') ? 'conditioning' : undefined
                    }
                    price={prog.price.replace('$', '')}
                    title={prog.title}
                    className="mt-2"
                  />
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
                    <div className="font-semibold text-emerald-400 mb-2">FREE INTRO — FULL IN SUPER BUNDLE OR PILLAR</div>
                    {prog.disclaimer}
                    <div className="mt-4 text-xs text-white/50">All sales final. 30-day guarantee. Questions? Email support@missionwinning.com. This sustains the free core for the global mission. Super Bundle members help shape it. Mission Winning LLC.</div>
                  <div className="mt-3 flex gap-3">
                    <a href="/feedback" className="text-emerald-400 hover:text-emerald-300 text-xs underline">Share wins &amp; feedback →</a>
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
