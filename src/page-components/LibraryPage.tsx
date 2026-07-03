'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { EXERCISES, getExerciseById } from "@/data/exercises";
import { PROGRAM_TAG_LABELS } from "@/data/exerciseEnrichment";
import { useWorkoutStore } from "@/store/workoutStore";
import { usePremium } from "@/hooks/usePremium";
import type { ProgramTag } from "@/types";

const TAG_OPTIONS: { value: ProgramTag | ""; label: string }[] = [
  { value: "", label: "All styles" },
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "conditioning", label: "Conditioning" },
  { value: "corrective", label: "Corrective" },
];

export function LibraryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [equip, setEquip] = useState("");
  const [tag, setTag] = useState<ProgramTag | "">("");
  const [level, setLevel] = useState("");
  const { premium } = usePremium();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const filtered = EXERCISES.filter((e) => {
    const matchQ =
      !q ||
      e.name.toLowerCase().includes(q.toLowerCase()) ||
      e.muscleGroups.some((m) => m.toLowerCase().includes(q.toLowerCase()));
    const matchE = !equip || (e.equipment || "").toLowerCase().includes(equip.toLowerCase());
    const matchTag = !tag || (e.tags ?? []).includes(tag);
    const matchLevel = !level || e.level === level;
    return matchQ && matchE && matchTag && matchLevel;
  });

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={Dumbbell}
          title={t('library', { defaultValue: 'Exercise Library' })}
          subtitle={`${EXERCISES.length}+ movements with cues and alternatives. Bodyweight and minimal equipment prioritized.`}
        />
        <p className="text-muted-foreground text-sm mt-2">
          <Link href="/log" className="underline">Today Hub</Link>
          {' · '}
          <Link href="/builder" className="underline">Program templates</Link>
          {premium ? ' — full library unlocked.' : ' — free core includes the full catalog.'}
        </p>
      </StaggerItem>

      <StaggerItem index={1}>
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search name or muscle..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={equip}
          onChange={(e) => setEquip(e.target.value)}
          className="border rounded px-3 bg-background text-sm"
        >
          <option value="">All Equipment</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="dumbbell">Dumbbells</option>
          <option value="barbell">Barbell</option>
          <option value="cable">Cable / Machine</option>
          <option value="band">Band</option>
          <option value="kettlebell">Kettlebell</option>
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as ProgramTag | "")}
          className="border rounded px-3 bg-background text-sm"
        >
          {TAG_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border rounded px-3 bg-background text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <span className="text-xs self-center text-muted-foreground">
          Showing {filtered.length} of {EXERCISES.length}
        </span>
      </div>
      </StaggerItem>

      <StaggerItem index={2}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <Card key={ex.id} className="content-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ex.name}</CardTitle>
              <div className="text-xs text-muted-foreground">
                {ex.muscleGroups.join(" • ")} • {ex.equipment || "Various"}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(ex.tags ?? []).slice(0, 3).map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {PROGRAM_TAG_LABELS[t]}
                  </Badge>
                ))}
                {ex.level && (
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {ex.level}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {ex.cues ? (
                <div>
                  <span className="font-medium">Key cues:</span> {ex.cues}
                </div>
              ) : (
                <div className="text-muted-foreground">Form cues coming soon for this movement.</div>
              )}
              {ex.alternatives && ex.alternatives.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Alternatives:</span>{" "}
                  {ex.alternatives
                    .map((id) => getExerciseById(id)?.name ?? id)
                    .join(", ")}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  startWorkout(ex.name, [{ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }]);
                  router.push('/active');
                }}
                className="text-xs px-3 py-1.5 border border-primary/50 rounded hover:bg-primary/10 font-medium w-full text-center"
              >
                Quick Add to Today&apos;s Workout →
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No exercises match these filters. Try clearing equipment or style filters.
        </p>
      )}
      </StaggerItem>
    </StaggerGroup>
  );
}
