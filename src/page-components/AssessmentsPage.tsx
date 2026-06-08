import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveNutritionEntry } from "@/lib/supabase"; // reuse for demo save, or extend

interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high';
  notes: string;
  recommendations: string[];
}

export function AssessmentsPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const premium = typeof window !== "undefined" && localStorage.getItem("mw_premium") === "true";

  const questions = [
    { key: "chest_pain", q: "Have you experienced any chest pain associated with either exercise or stress?" },
    { key: "shortness_breath", q: "Have you experienced shortness of breath with or without exercise?" },
    { key: "fainting", q: "Have you experienced fainting or light-headedness?" },
    { key: "hospital", q: "Have you had a recent hospitalization for any cause?" },
    { key: "ortho", q: "Do you have any orthopedic conditions (including arthritis)?" },
    { key: "heart", q: "Have you ever experienced a rapid heartbeat or palpitations?" },
    { key: "no_exercise", q: "Is there any reason why you should not follow a regular exercise program?" },
    { key: "smoke", q: "Do you smoke? (yes/no/former)" },
    { key: "sleep", q: "Average hours of sleep per night? (under 5 / 5-7 / 8-10 / over 10)" },
    { key: "energy", q: "Daily energy level? (high / moderate / low)" },
    // Expanded from Health History form (exact/adapted for digital)
    { key: "high_bp", q: "Has your doctor ever diagnosed you with high blood pressure?" },
    { key: "bone_joint", q: "Has your doctor ever diagnosed you with a bone or joint problem that has been or could be made worse by exercise?" },
    { key: "family_heart", q: "Family history of heart disease, heart attack, or stroke before age 55 (father/brother) or 65 (mother/sister)?" },
    { key: "smoking_detail", q: "Current smoking: non / former (date quit) / <15 cigs/day / 16-25 / >25 or pipe/cigar?" },
    { key: "pain_history", q: "Any current or past pain in: head/neck, upper/lower back, shoulder/clavicle, arm/elbow, wrist/hand, hip/pelvis, thigh/knee, arthritis, hernia, surgeries? (list)" },
    { key: "meds", q: "Taking any medications? List with dosage/frequency and condition." },
    { key: "allergies", q: "List any and all allergies." },
    { key: "lifestyle", q: "Occupation stress (low/med/high), energy level, caffeine/alcohol use, recent weight fluctuation, diet plan or supplements?" },
  ];

  // Stage-matched questions + OARS from coaching materials (quick guide). Use for personalization, not diagnosis.
  const stages = [
    { name: "Pre-Contemplation (Not Ready)", focus: "Build awareness without pressure. Evoke curiosity and values.", qs: ["What do you enjoy about your current habits?", "How do you view your health or energy 5 years from now?"] },
    { name: "Contemplation (Getting Ready)", focus: "Normalize ambivalence. Explore benefits and barriers.", qs: ["What might be some benefits if you made this change?", "What feels hardest about starting?"] },
    { name: "Preparation / Action", focus: "Strengthen confidence. Reinforce progress. Small wins + autonomy.", qs: ["What's one small step you could take this week?", "What's been working best so far?"] },
    { name: "Maintenance", focus: "Support autonomy, mastery, relapse prevention. New goals.", qs: ["How do you maintain progress when life gets stressful?", "What new goals feel inspiring now?"] },
  ];
  const [selectedStage, setSelectedStage] = useState(0);

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const submitAssessment = () => {
    const yesFlags = Object.values(answers).filter(v => v.toLowerCase().includes('yes') || v.toLowerCase().includes('low')).length;
    let risk: 'low' | 'moderate' | 'high' = 'low';
    let notes = "Great baseline. Proceed with standard programs.";
    let recs = ["Start with Beginner Full Body or Bodyweight program.", "Focus on consistent form."];

    if (yesFlags >= 3) {
      risk = 'high';
      notes = "Multiple flags detected. Strongly recommend medical clearance before intense training.";
      recs = ["Begin with Corrective & Mobility block.", "Consult physician.", "Use low-impact options and monitor symptoms."];
    } else if (yesFlags >= 1) {
      risk = 'moderate';
      notes = "Some caution advised. Consider starting with corrective work.";
      recs = ["Prioritize the Corrective Exercise Specialist templates.", "Build with Bodyweight & Dumbbell Starter first."];
    }

    const res: AssessmentResult = { riskLevel: risk, notes, recommendations: recs };
    setResult(res);

    // Save a note to nutrition logs as demo assessment record (or extend table later)
    const today = new Date().toISOString().split('T')[0];
    saveNutritionEntry({ date: today, name: `Assessment: ${risk} risk`, protein: 0, cals: 0 }).catch(() => {});
  };

  if (!premium) {
    return <div className="max-w-md mx-auto text-center py-12">
      <h2 className="text-2xl font-bold">Assessments &amp; Readiness</h2>
      <p className="mt-2">Digital ParQ / Health History + movement screening based on corrective exercise protocols.</p>
      <p className="mt-4 text-sm">Unlock with Premium or any specialist program.</p>
      <Button className="mt-4" onClick={() => window.location.href = "/programs"}>View Programs</Button>
    </div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Readiness Assessment</h2>
        <p className="text-muted-foreground">Based on standard health history and ParQ-style questions (from corrective exercise materials). Answer honestly for personalized guidance.</p>
      </div>

      {!result && (
        <Card>
          <CardHeader><CardTitle>Quick Health &amp; Lifestyle Screen</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {questions.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-sm font-medium">{item.q}</div>
                <div className="flex gap-2 flex-wrap">
                  {['Yes', 'No', 'Unsure'].map(opt => (
                    <Button key={opt} size="sm" variant={answers[item.key] === opt.toLowerCase() ? 'default' : 'outline'} onClick={() => handleAnswer(item.key, opt.toLowerCase())}>{opt}</Button>
                  ))}
                  {item.key === 'smoke' || item.key === 'sleep' || item.key === 'energy' ? (
                    <input className="border rounded px-2 text-sm" placeholder="details" onBlur={e => handleAnswer(item.key, e.target.value || answers[item.key] || '')} />
                  ) : null}
                </div>
              </div>
            ))}
            <Button className="mt-4 w-full" onClick={submitAssessment} disabled={Object.keys(answers).length < 5}>Submit Assessment</Button>
            <div className="text-xs text-muted-foreground">This is educational screening only — not medical advice. Always consult a doctor.</div>
          </CardContent>
        </Card>
      )}

      {/* Stage + OARS prompts from coaching guide (for personalization & coach mode) */}
      <Card>
        <CardHeader><CardTitle>Stage of Change + Coaching Prompts</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {stages.map((s, i) => (
              <Button key={i} size="sm" variant={selectedStage === i ? 'default' : 'outline'} onClick={() => setSelectedStage(i)}>{s.name.split('(')[0].trim()}</Button>
            ))}
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="font-medium text-emerald-400">Coach Focus: {stages[selectedStage].focus}</div>
            <ul className="list-disc pl-5 mt-1 text-white/80">
              {stages[selectedStage].qs.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground">OARS in practice: Open questions, Affirm strengths, Reflect back, Summarize. Match approach to readiness. Use to personalize programs or coaching sessions. (From coaching quick guide.)</div>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 ${result.riskLevel === 'high' ? 'border-red-500' : result.riskLevel === 'moderate' ? 'border-yellow-500' : 'border-emerald-500'}`}>
          <CardHeader>
            <CardTitle>Assessment Result: <span className="uppercase">{result.riskLevel} risk</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{result.notes}</p>
            <div>
              <div className="font-semibold mb-2">Recommendations:</div>
              <ul className="list-disc pl-5 space-y-1">
                {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <Button onClick={() => { setResult(null); setAnswers({}); }}>Retake Assessment</Button>
            <div className="text-xs">Results saved to your profile logs. Use to guide program choice in the Builder.</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
