'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Dumbbell, Flame, Play, Target, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workoutStore";
import { computeReadiness, getRecommendedFocus, computeWinScore } from "@/lib/score";
import { EXERCISES } from "@/data/exercises";
import { getUser, signInMagic, saveNutritionEntry, getUserNutritionForDate } from "@/lib/supabase";

export function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startEmptyWorkout = useWorkoutStore((s) => s.startEmptyWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const recent = workoutHistory.slice(0, 3);

  // Auth for cloud and real premium (Supabase magic link)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showSignin, setShowSignin] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);

  // Recent pillar wins from cloud (Move/Mind/Assess logs as nutrition entries)
  const [recentPillarWins, setRecentPillarWins] = useState<any[]>([]);
  const [lastAssessment, setLastAssessment] = useState<any>(null);

  useEffect(() => {
    getUser().then(u => {
      if (u?.email) setUserEmail(u.email);
    });
  }, []);

  const handleMagic = async () => {
    if (!signinEmail) return;
    setSigninLoading(true);
    try {
      await signInMagic(signinEmail);
      alert(`Magic link sent to ${signinEmail}. Check email (including spam) and click to sign in.`);
      setSigninEmail("");
      setShowSignin(false);
    } catch (e: any) {
      alert("Failed to send magic link: " + (e?.message || e));
    } finally {
      setSigninLoading(false);
    }
  };

  // Freeletics-inspired free core note (per vision.md): Generous basics for everyone; premium for "awesome" depth + bundle synergy.
  const totalSessions = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);

  // Simple local streak (retention feature - challenges logic stub per plan "What Else"; full UI in follow-up)
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem('mw_streak') || '0');
    const lastWorkout = workoutHistory[0]?.completedAt ? new Date(workoutHistory[0].completedAt) : null;
    if (lastWorkout) {
      const daysSince = Math.floor((Date.now() - lastWorkout.getTime()) / (1000*3600*24));
      if (daysSince === 0 || daysSince === 1) {
        setStreak(savedStreak || 1);
      } else {
        setStreak(0);
        localStorage.setItem('mw_streak', '0');
      }
    }
    // Challenges progress stub (from plan "What Else": 7-day, protein, volume, program complete). Enable UI + local save when ready.
  }, [workoutHistory, streak, totalVolume]);

  // Auto load cloud history for signed in users (quick win for persistence)
  useEffect(() => {
    const load = async () => {
      const { loadFromCloud } = useWorkoutStore.getState();
      const u = await getUser();
      if (u) {
        await loadFromCloud();
        // Load recent pillar wins from nutrition cloud (Move/Mind/Assess logs)
        try {
          const today = new Date().toISOString().split('T')[0];
          const cloudWins = await getUserNutritionForDate(today);
          const wins = cloudWins.filter((w: any) => /win|assessment|mobility|mind/i.test(w.name || ''));
          setRecentPillarWins(wins.slice(0, 5));
        } catch {}
      }
      // Load last assessment from local (saved on submit)
      try {
        const la = localStorage.getItem('mw_last_assessment');
        if (la) setLastAssessment(JSON.parse(la));
      } catch {}
    };
    load();
  }, []);

  const handleQuickStart = () => {
    if (activeWorkout) {
      router.push("/active");
      return;
    }
    startEmptyWorkout();
    router.push("/active");
  };

  // Free starter programs (always available - no premium required, core mission)
  const freeStarters = [
    { name: "Free Full Body Starter (5x5)", exercises: [
      { exerciseId: "squats", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "bench-press", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "barbell-row", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "overhead-press", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "deadlift", sets: [{ reps: 5, weight: 0 }] },
    ]},
    { name: "Free Bodyweight Circuit", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "burpees", sets: [{ reps: 5, weight: 0 }] },
    ]},
    { name: "Free Upper Focus (Bodyweight + DB)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "overhead-press", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bicep-curl", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "tricep-pushdown", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "lat-pulldown", sets: [{ reps: 10, weight: 0 }] },
    ]},
    { name: "Free Lower + Core Starter", exercises: [
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "romanian-deadlift", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Free Push/Pull Beginner", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "overhead-press", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "barbell-row", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bicep-curl", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "tricep-pushdown", sets: [{ reps: 10, weight: 0 }] },
    ]},
    { name: "Free Full Body Bodyweight", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "burpees", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 15, weight: 0 }] },
    ]},
    { name: "Daily Mobility Circuit (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bear-crawl", sets: [{ reps: 10, weight: 0 }] },
    ]},
    { name: "Bodyweight Strength Circuit", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      { exerciseId: "dips-chair", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Mind + Movement Habit Stack", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Progressive Bodyweight Strength", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "pike-pushup", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
      { exerciseId: "single-leg-glute", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Daily Mobility + Mind Habit", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
      { exerciseId: "inchworm", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "bear-crawl", sets: [{ reps: 12, weight: 0 }] },
    ]},
    { name: "Full Body Habit Builder", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Daily Habit Reset (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Mobility Only Daily", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
      { exerciseId: "inchworm", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "bear-crawl", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "wall-sit", sets: [{ reps: 30, weight: 0 }] },
    ]},
    { name: "Simple Daily Movement Habit", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Fuel + Movement Habit", exercises: [
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Core Stability Builder", exercises: [
      { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "side-plank", sets: [{ reps: 20, weight: 0 }] },
    ]},
    { name: "Upper Body Daily", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "pike-pushup", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "dips-chair", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Lower Body Daily", exercises: [
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
    ]},
    { name: "Full Habit Stack Daily", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Mobility + Mind Daily", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
      { exerciseId: "inchworm", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Full Bodyweight Habit", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bear-crawl", sets: [{ reps: 10, weight: 0 }] },
    ]},
    { name: "Desk Reset Flow (Anytime)", exercises: [
      { exerciseId: "neck-circles-release", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "wall-angels", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "thread-needle", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "ankle-dorsiflex-rock", sets: [{ reps: 10, weight: 0 }] },
    ]},
    { name: "Animal Flow Basics (Free)", exercises: [
      { exerciseId: "bear-crawl", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "inchworm", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "pushup-to-down-dog", sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: "frog-pose", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Balance & Stability Stack", exercises: [
      { exerciseId: "single-leg-stand-hold", sets: [{ reps: 30, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "side-plank", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Mind + Mobility Micro Stack (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "thread-needle", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "superman-to-yti", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Global Protein + Movement Habit (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "wall-angels", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "Quick Pillar Stack Habit (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Assessment-Guided Safe Start (Free)", exercises: [
      { exerciseId: "wall-sit", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Mindful Movement Daily (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "wall-angels", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "No-Equip Full Body Daily (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Pillar Sync Daily (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Assessment Recovery Flow (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "wall-sit", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
    ]},
    { name: "Pillar Sync Daily (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Pillar Sync Daily (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    ]},
    { name: "Assessment Recovery Flow (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "wall-sit", sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
    ]},
    { name: "Daily Mobility + Mind Stack (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "No-Equip Pillar Stack (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
    { name: "Daily Mobility + Mind Stack (Free)", exercises: [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
    ]},
    { name: "No-Equip Pillar Stack (Free)", exercises: [
      { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "inverted-row", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ]},
  ];

  const startFreeStarter = (name: string, exs: any[]) => {
    startWorkout(name, exs);
    router.push("/active");
  };

  const handleStartSaved = (id: string) => {
    const workout = savedWorkouts.find((w) => w.id === id);
    if (!workout) return;
    startWorkout(workout.name, workout.exercises, workout.id);
    router.push("/active");
  };

  // === Today Hub computations using shared util (clean, reusable) ===
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const readiness = computeReadiness(workoutHistory);
  const recommendedFocus = getRecommendedFocus(readiness);

  // High protein days (from nutrition logs)
  let highProteinDays = 0;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
    const byDate: Record<string, number> = {};
    logs.forEach((l: any) => {
      const d = l.date || new Date().toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + (l.protein || 0);
    });
    highProteinDays = Object.values(byDate).filter((p: number) => p >= 150).length;
  } catch {}

  // Win/Mission Score via util
  const scoreBreakdown = computeWinScore({
    streak,
    highProteinDays,
    totalSessions,
    totalVolume,
    savedCount: savedWorkouts.length,
  });
  const score = scoreBreakdown.total;

  const MAJOR_GROUPS: Array<keyof typeof readiness> = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  // Onboarding awareness for progression
  const isOnboarded = typeof window !== 'undefined' && !!(localStorage.getItem('mw_experience') && localStorage.getItem('mw_equipment'));
  const userGoal = typeof window !== 'undefined' ? (localStorage.getItem('mw_primary_goal') || 'Build strength and stay healthy') : 'Build strength and stay healthy';
  const userEquip = typeof window !== 'undefined' ? (localStorage.getItem('mw_equipment') || 'full-gym') : 'full-gym';

  return (
    <div className="space-y-8">
      {/* Clear functional homepage header — distinct from sales Landing. This is the daily "Today" command center. */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight fitness-text-gradient">
              {t('appName', { defaultValue: 'Mission Winning' })} • {t('today', { defaultValue: 'Today' })}
            </h2>
            <p className="mt-1 text-muted-foreground">{today} — {t('recommendedFocus', { defaultValue: recommendedFocus })} {userEquip === 'bodyweight' ? '(bodyweight focus)' : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">MISSION SCORE</div>
            <div className="text-4xl font-bold text-emerald-400 flex items-center gap-2">
              {score} <Trophy className="h-6 w-6" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          One clear action. Track your wins. <strong>Free core for all</strong> — the path forward. <a href="/bundle" className="underline text-emerald-400">Super Bundle</a> for full pillars (train + fuel + move + mind + learn). See <a href="/vision" className="underline">vision.md</a>.
        </p>

        {/* Quick sign in for cloud sync + real premium (visible when not signed in) */}
        {!userEmail && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded p-3 text-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-emerald-400 font-medium">Sign in for cloud sync, real premium status from Supabase, and cross-device history (free magic link — no password).</span>
              {!showSignin ? (
                <Button size="sm" variant="outline" onClick={() => setShowSignin(true)} className="md:ml-auto">Sign in / Sign up</Button>
              ) : (
                <div className="flex gap-2 items-center w-full md:w-auto">
                  <input
                    type="email"
                    value={signinEmail}
                    onChange={e => setSigninEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 text-sm bg-background border border-border/50 rounded px-2 py-1"
                  />
                  <Button size="sm" onClick={handleMagic} disabled={signinLoading || !signinEmail}>
                    {signinLoading ? "Sending..." : "Send link"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowSignin(false)}>✕</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isOnboarded && (
          <div className="mt-2 text-xs p-2 bg-amber-950/30 border border-amber-500/30 rounded">
            First time? <a href="/profile" className="underline text-amber-400">Complete Mission Setup in Profile</a> to personalize your Win Score, readiness, and starting program recommendation.
          </div>
        )}
      </div>

      {/* Primary Action Hero (Forge "JUST GO" spirit — biggest, clearest CTA on the functional homepage) */}
      <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Target className="h-5 w-5" /> Ready to Win Today
          </CardTitle>
          <CardDescription>
            {activeWorkout
              ? "Workout in progress — jump back in and keep the momentum."
              : `Recommended: ${recommendedFocus}. Start now — no thinking required.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="fitness" size="lg" className="w-full md:w-auto text-lg py-6" onClick={handleQuickStart}>
            <Play className="h-5 w-5 mr-2" />
            {activeWorkout ? "RESUME ACTIVE WORKOUT" : "TAKE MASSIVE ACTION — START WORKOUT"}
          </Button>

          {/* Free starter programs - always unlocked for the core mission */}
          <div className="mt-2 text-xs text-muted-foreground">Free Starters (no premium needed):</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {freeStarters.map((s, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => startFreeStarter(s.name, s.exercises)}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="mt-2">
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              alert('Great! Log a post-mobility recovery snack (e.g. yogurt bowl) in Nutrition to build Fuel + Move synergy.');
              window.location.href = '/nutrition';
            }}>Log Recovery Snack (Fuel + Move) →</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
              localStorage.setItem('mw_streak', String(current));
              alert(`Mobility habit logged! +1 to streak (${current} days). Synergy with Move pillar builds the path.`);
              window.location.reload();
            }}>Log Mobility Habit (+streak)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Quick Mind Win from Home', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Quick Mind Win from Home', date: today}, ...prev].slice(0,5));
                alert(`Mind win logged! +1 streak (${current}). ${u ? 'Cloud saved.' : ''}`);
              } catch {}
            }}>Log Mind Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Quick Fuel + Move Win', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Quick Fuel + Move Win', date: today}, ...prev].slice(0,5));
                alert(`Fuel + Move win logged! +1 streak (${current}). Check Nutrition.`);
              } catch {}
            }}>Log Fuel + Move Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Quick Mind + Move Win', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Quick Mind + Move Win', date: today}, ...prev].slice(0,5));
                alert(`Mind + Move win logged! +1 streak (${current}).`);
              } catch {}
            }}>Log Mind + Move Win (+streak + cloud)</Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {savedWorkouts.slice(0, 3).map((w) => (
              <Button key={w.id} variant="outline" size="sm" onClick={() => handleStartSaved(w.id)}>
                {w.name}
              </Button>
            ))}
            {savedWorkouts.length === 0 && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/builder")}>
                Or build a custom session →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Muscle Readiness (Forge-style actionable "know what to train" — inferred from your logs) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Muscle Readiness
          </CardTitle>
          <CardDescription>Based on your recent training history. Prime groups are ready for focus.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {MAJOR_GROUPS.map(g => {
              const r = readiness[g];
              const isPrime = r.days >= 4;
              const matchingEx = EXERCISES.filter(e => e.muscleGroups.includes(g)).slice(0, 2);
              return (
                <div key={g} className={`p-3 rounded border ${isPrime ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-border/60'}`}>
                  <div className="font-medium">{g}</div>
                  <div className={isPrime ? "text-emerald-400" : "text-muted-foreground"}>
                    {r.days === 99 ? 'No recent data' : `${r.days}d rest`} — {r.status}
                  </div>
                  {isPrime && matchingEx.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs w-full"
                      onClick={() => {
                        const template = matchingEx.map(ex => ({ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }));
                        startWorkout(`${g} Focus`, template);
                        router.push("/active");
                      }}
                    >
                      Train {g} now →
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Train prime groups for best results. Rest others. Your logs make this smarter over time.</div>
        </CardContent>
      </Card>

      {/* Recommended starting point - tied to onboarding for clear progression */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Recommended Starting Point
          </CardTitle>
          <CardDescription>Based on your mission setup (edit in Profile).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Focus:</span> {userGoal} {userEquip === 'bodyweight' ? 'with bodyweight/minimal' : 'with available equipment'}
          </div>
          <div className="text-muted-foreground">Start with a simple full-body or split from Builder, or launch a program template. Complete sessions to level up your Win Score and unlock premium education.</div>
          <Button variant="outline" size="sm" onClick={() => router.push('/builder')}>
            Go to Builder / Choose Template →
          </Button>
        </CardContent>
      </Card>

      {/* Stats row (supporting, not the hero) */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Sessions
            </CardDescription>
            <CardTitle className="text-3xl">{totalSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Total Volume
            </CardDescription>
            <CardTitle className="text-3xl">
              {totalVolume.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">lbs</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Saved Routines
            </CardDescription>
            <CardTitle className="text-3xl">{savedWorkouts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Current Streak
            </CardDescription>
            <CardTitle className="text-3xl">{streak} <span className="text-lg font-normal text-muted-foreground">days</span></CardTitle>
          </CardHeader>
        </Card>

        {/* Last Assessment + Recent Pillar Wins (cloud loaded) - free core visibility + functional */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Last Assessment &amp; Recent Pillar Wins
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {lastAssessment ? (
              <div>Last: <span className="font-medium uppercase">{lastAssessment.risk}</span> risk ({lastAssessment.date}) • <a href="/assessments" className="underline">Retake</a></div>
            ) : (
              <div>No assessment yet. <a href="/assessments" className="underline">Take free Readiness Assessment →</a></div>
            )}

            {recentPillarWins.length > 0 ? (
              <div>
                Recent pillar wins:
                <ul className="list-disc pl-4 mt-1">
                  {recentPillarWins.map((w, i) => <li key={i}>{w.name} {w.date && `(${w.date})`}</li>)}
                </ul>
                <a href="/nutrition" className="underline">See full in Nutrition →</a>
              </div>
            ) : (
              <div>Log wins from /move or /mind "Do it" (saves to cloud Nutrition when signed in).</div>
            )}

            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Daily Pillar Win (quick log)', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Daily Pillar Win (quick log)', date: today}, ...prev].slice(0,5));
                alert(`Daily win logged! +1 streak (${current}). ${u ? 'Saved to cloud.' : 'Sign in for cloud sync.'}`);
              } catch {}
            }}>Log Daily Pillar Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Quick Mind Win from Home', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Quick Mind Win from Home', date: today}, ...prev].slice(0,5));
                alert(`Mind win logged! +1 streak (${current}). ${u ? 'Cloud saved.' : ''}`);
              } catch {}
            }}>Log Mind Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Quick Move Win from Home', protein: 0, cals: 0 });
                const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(current));
                setRecentPillarWins(prev => [{name: 'Quick Move Win from Home', date: today}, ...prev].slice(0,5));
                alert(`Move win logged! +1 streak (${current}). ${u ? 'Cloud saved.' : ''}`);
              } catch {}
            }}>Log Move Win (+streak + cloud)</Button>
            <Button size="sm" variant="outline" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                if (u) {
                  const today = new Date().toISOString().split('T')[0];
                  const cloud = await getUserNutritionForDate(today);
                  const wins = cloud.filter((w: any) => /win|assessment|mobility|mind/i.test(w.name || ''));
                  setRecentPillarWins(wins.slice(0, 5));
                  alert('Pillar wins refreshed from cloud.');
                } else {
                  alert('Sign in to load cloud wins.');
                }
              } catch {}
            }}>Refresh pillar wins from cloud</Button>
          </CardContent>
        </Card>
      </div>

      {/* Wins & Challenges (reframed as proof of massive action — elevated but secondary to the primary CTA) */}
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Trophy className="h-5 w-5" /> Your Wins &amp; Streaks
          </CardTitle>
          <CardDescription>Proof you are taking massive action. Complete these for badges, coaching priority, and exclusive drops.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div className={streak >= 7 ? "text-emerald-400 font-medium" : ""}>
            {streak >= 7 ? "✓" : "○"} 7-Day Streak ({streak}/7) {streak >= 7 && "🏅"}
          </div>
          <div className={totalVolume > 1000 ? "text-emerald-400 font-medium" : ""}>
            {totalVolume > 1000 ? "✓" : "○"} 1000kg+ Total Volume ({totalVolume.toLocaleString()}/1000) {totalVolume > 1000 && "🏅"}
          </div>
          <div className={totalSessions >= 15 ? "text-emerald-400 font-medium" : ""}>
            {totalSessions >= 15 ? "✓" : "○"} 15+ Sessions Logged ({totalSessions}/15) {totalSessions >= 15 && "🏅"}
          </div>
          <div className={savedWorkouts.length >= 3 ? "text-emerald-400 font-medium" : ""}>
            {savedWorkouts.length >= 3 ? "✓" : "○"} 3+ Saved Routines ({savedWorkouts.length}/3) {savedWorkouts.length >= 3 && "🏅"}
          </div>
          <div className={highProteinDays >= 5 ? "text-emerald-400 font-medium" : ""}>
            {highProteinDays >= 5 ? "✓" : "○"} High Protein Days (150g+) ({highProteinDays}/5+) {highProteinDays >= 5 && "🏅"}
          </div>
          <div className="col-span-2 text-xs text-muted-foreground">Log wins daily — streaks & volume feed your Mission Score. Full cross-pillar challenges in updates.</div>
          <div className="col-span-2 flex gap-2 mt-1">
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => { 
              const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1; 
              localStorage.setItem('mw_streak', String(current)); 
              alert(`Win logged! Streak now ${current}. Refresh or complete a workout to update.`); 
              window.location.reload(); 
            }}>Log a daily win +1 streak</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => { alert('Great protein day logged (demo). Complete real logs in /nutrition for real tracking.'); }}>Log high-protein day</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
              try {
                const { getUser, saveNutritionEntry } = await import('@/lib/supabase');
                const u = await getUser();
                const today = new Date().toISOString().split('T')[0];
                if (u) await saveNutritionEntry({ date: today, name: 'Mind Win: 5-min breath + gratitude', protein: 0, cals: 0 });
                const cur = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
                localStorage.setItem('mw_streak', String(cur));
                alert(`Mind Win logged! +1 streak (${cur}). Check Nutrition for the entry.`);
              } catch {}
            }}>Log Mind Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => startFreeStarter("Daily Mobility Circuit (Free)", freeStarters.find(s => s.name.includes("Mobility"))?.exercises || [])}>Quick Mobility Win →</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              const current = parseInt(localStorage.getItem('mw_streak') || '0') + 1;
              localStorage.setItem('mw_streak', String(current));
              alert(`Mobility habit logged! +1 to streak (${current} days). Synergy with Move pillar builds the path.`);
              window.location.reload();
            }}>Log Mobility Habit (+streak)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => startFreeStarter("Daily Mobility + Mind Habit", freeStarters.find(s => s.name.includes("Mind Habit"))?.exercises || [])}>Start Daily Habit Stack →</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              alert('Log a post-mobility recovery snack in Nutrition (e.g. yogurt bowl). Builds Fuel + Move synergy.');
              window.location.href = '/nutrition';
            }}>Log Recovery Snack (Fuel + Move) →</Button>
          </div>
        </CardContent>
      </Card>

      {/* PWA Install Banner (kept, now in context of daily use) */}
      {typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-sm flex items-center justify-between">
          <span>Install Mission Winning for offline use anywhere (PWA). Train in any gym, park, or home — no excuses.</span>
          <Button size="sm" variant="outline" onClick={() => {
            const trig = (window as any).triggerPwaInstall;
            if (trig) trig();
            else {
              const p = (window as any).deferredPwaPrompt && (window as any).deferredPwaPrompt();
              if (p) p.prompt();
              else alert('Use browser menu (⋮ > Add to Home Screen / Install).');
            }
          }}>Install Now</Button>
        </div>
      )}

      {/* Recent Activity (supporting history view) */}
      {recent.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Recent Wins</h3>
          <div className="grid gap-3">
            {recent.map((log) => (
              <Card key={log.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{log.workoutName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(log.completedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span>{log.totalVolume.toLocaleString()} lbs</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="link" className="mt-2 px-0" onClick={() => router.push("/history")}>
            View full history →
          </Button>
        </div>
      )}
    </div>
  );
}
