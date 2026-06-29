/** Shared nav config — Simple mode uses primary tabs only; Pro adds More tools. */
import {
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Dumbbell,
  History,
  Home,
  MapPin,
  PenTool,
  Shield,
  Sparkles,
  Trophy,
  User,
  UtensilsCrossed,
  Wind,
} from 'lucide-react';

export const PRIMARY_NAV = [
  { href: '/log', labelKey: 'navToday', label: 'Today', icon: Home },
  { href: '/active', labelKey: 'navTrain', label: 'Train', icon: Dumbbell, pulseWhenActive: true as const },
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel', icon: UtensilsCrossed },
  { href: '/track', labelKey: 'navTrack', label: 'Track', icon: MapPin },
  { href: '/profile', labelKey: 'navYou', label: 'You', icon: User },
];

export const MORE_NAV = [
  { href: '/move', labelKey: 'navMove', label: 'Move', icon: Wind, descriptionKey: 'moreMoveDesc', description: 'Mobility flows' },
  { href: '/mind', labelKey: 'navMind', label: 'Mind', icon: Brain, descriptionKey: 'moreMindDesc', description: 'Breathing & recovery' },
  { href: '/learn', labelKey: 'navLearn', label: 'Learn', icon: BookOpen, descriptionKey: 'moreLearnDesc', description: 'Education paths' },
  { href: '/builder', labelKey: 'navBuilder', label: 'Builder', icon: PenTool, descriptionKey: 'moreBuilderDesc', description: 'Build workouts' },
  { href: '/library', labelKey: 'navLibrary', label: 'Library', icon: Dumbbell, descriptionKey: 'moreLibraryDesc', description: 'Exercise catalog' },
  { href: '/history', labelKey: 'navHistory', label: 'History', icon: History, descriptionKey: 'moreHistoryDesc', description: 'Past sessions' },
  { href: '/leaderboard', labelKey: 'navLeaderboard', label: 'Leaderboard', icon: Trophy, descriptionKey: 'moreLeaderboardDesc', description: 'Global & regional rankings' },
  { href: '/benchmarks', labelKey: 'navReadiness', label: 'Readiness tests', icon: Shield, descriptionKey: 'moreReadinessDesc', description: 'Push-ups, pull-ups, strength standards', military: true },
  { href: '/assessments', labelKey: 'navHealth', label: 'Health screen', icon: ClipboardList, descriptionKey: 'moreHealthDesc', description: 'PAR-Q assessment' },
  { href: '/calculators', labelKey: 'navCalculators', label: 'Calculators', icon: Calculator, descriptionKey: 'moreCalcDesc', description: 'Macros & tools' },
  { href: '/bundle', labelKey: 'navBundle', label: 'Super Bundle', icon: Sparkles, descriptionKey: 'moreBundleDesc', description: 'Premium pillars' },
];
