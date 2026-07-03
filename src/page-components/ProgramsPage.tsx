'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Check } from 'lucide-react';
import { UnlockButton } from '@/components/UnlockButton';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useState } from 'react';

export function ProgramsPage() {
  const { t } = useTranslation();
  const [filterGoal, setFilterGoal] = useState<string>('All');
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
    <InfoPageShell
      icon={BookOpen}
      title={t('infoProgramsTitle', { defaultValue: 'Learn programs' })}
      subtitle={t('infoProgramsSubtitle', {
        defaultValue:
          'Premium practical education as part of the Super Bundle. Free core tools and intros for everyone worldwide.',
      })}
      variant="sections"
      showLegalFooter
    >
        <Card className="content-card border-amber-500/30 bg-amber-950/10">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Legacy catalog — the Learn pillar has moved to{' '}
            <Link href="/learn" className="text-emerald-400 hover:underline">
              /learn
            </Link>
            . See{' '}
            <Link href="/bundle" className="text-emerald-400 hover:underline">
              Super Bundle
            </Link>{' '}
            for full access.
          </CardContent>
        </Card>

      <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-muted-foreground self-center">Filter by goal:</span>
          {['All', 'Hypertrophy', 'Corrective', 'Strength/Business', 'Conditioning'].map((g) => (
            <Button key={g} size="sm" variant={filterGoal === g ? 'default' : 'outline'} onClick={() => setFilterGoal(g)}>
              {g}
            </Button>
          ))}
          <span className="text-muted-foreground self-center ml-2">Equipment:</span>
          {['All', 'Bodyweight/Minimal', 'Gym/Barbell'].map((e) => (
            <Button key={e} size="sm" variant={filterEquip === e ? 'default' : 'outline'} onClick={() => setFilterEquip(e)}>
              {e}
            </Button>
          ))}
        </div>

      <div className="space-y-6">
          {filteredPrograms.map((prog, idx) => (
            <Card key={idx} className="content-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{prog.title}</CardTitle>
                    <div className="text-emerald-400 mt-1 text-sm">
                      {prog.duration} • {prog.price} one-time
                    </div>
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
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-3">
                    <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      What you get
                    </h4>
                    <ul className="space-y-2">
                      {prog.whatYouGet.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm space-y-3">
                    <div className="font-semibold text-emerald-400 text-xs uppercase tracking-wide">
                      Free intro — full in Super Bundle
                    </div>
                    <p className="text-muted-foreground">{prog.disclaimer}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/feedback" className="text-emerald-400 hover:underline text-xs">
                        Share feedback →
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => exportProgramPDF(prog)} className="text-xs h-7">
                        Download summary
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        Bundle all programs for significant discount (coming soon). Existing purchasers get notified of updates.
      </p>
    </InfoPageShell>
  );
}
