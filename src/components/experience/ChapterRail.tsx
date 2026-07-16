import { XP } from '@/components/experience/experienceStrings';

const CHAPTERS = [
  { id: 'signal', label: '00' },
  { id: 'why', label: '01' },
  { id: 'path', label: '02' },
  { id: 'chambers', label: '03' },
  { id: 'score', label: '04' },
  { id: 'free', label: '05' },
  { id: 'proof', label: '06' },
  { id: 'commission', label: '07' },
] as const;

export function ChapterRail() {
  return (
    <nav className="xp-rail" aria-label={XP.railAria}>
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`}>
          {c.label}
        </a>
      ))}
    </nav>
  );
}
