import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { notFound } from 'next/navigation';
import {
  EQUIPMENT_HUBS,
  equipmentHubFromSlug,
  exercisesForEquipment,
  type EquipmentHubSlug,
} from '@/lib/exerciseSeo';
import { ExerciseEquipmentHubPage } from '@/page-components/ExerciseEquipmentHubPage';

export const dynamic = 'force-static';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EQUIPMENT_HUBS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = equipmentHubFromSlug(slug);
  if (!hub) return { title: 'Exercises' };
  return publicPageMetadata({
    title: `${hub.label} exercises — free library`,
    description: `Free ${hub.label.toLowerCase()} exercises with cues. Track sets offline — no account, no paywall on the basics.`,
    path: `/exercises/equipment/${slug}`,
  });
}

export default async function EquipmentHubRoute({ params }: Props) {
  const { slug } = await params;
  const hub = equipmentHubFromSlug(slug);
  if (!hub) notFound();
  const exercises = exercisesForEquipment(hub.slug as EquipmentHubSlug);
  return <ExerciseEquipmentHubPage equipmentLabel={hub.label} exercises={exercises} />;
}
