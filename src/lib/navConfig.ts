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
  Target,
  User,
  UtensilsCrossed,
  Wind,
  Zap,
} from 'lucide-react';

export const PRIMARY_NAV = [
  { href: '/log', label: 'Today', icon: Home },
  { href: '/active', label: 'Train', icon: Dumbbell, pulseWhenActive: true as const },
  { href: '/nutrition', label: 'Fuel', icon: UtensilsCrossed },
  { href: '/track', label: 'Track', icon: MapPin },
  { href: '/profile', label: 'You', icon: User },
];

export const MORE_NAV = [
  { href: '/move', label: 'Move', icon: Wind, description: 'Mobility flows' },
  { href: '/mind', label: 'Mind', icon: Brain, description: 'Breathing & recovery' },
  { href: '/learn', label: 'Learn', icon: BookOpen, description: 'Education paths' },
  { href: '/builder', label: 'Builder', icon: PenTool, description: 'Build workouts' },
  { href: '/library', label: 'Library', icon: Dumbbell, description: 'Exercise catalog' },
  { href: '/history', label: 'History', icon: History, description: 'Past sessions' },
  { href: '/benchmarks', label: 'Readiness tests', icon: Shield, description: 'Push-ups, pull-ups, strength standards', military: true },
  { href: '/assessments', label: 'Health screen', icon: ClipboardList, description: 'PAR-Q assessment' },
  { href: '/calculators', label: 'Calculators', icon: Calculator, description: 'Macros & tools' },
  { href: '/bundle', label: 'Super Bundle', icon: Sparkles, description: 'Premium pillars' },
] as const;

export { Zap, Target };
