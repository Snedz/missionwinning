'use client';

import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

export function VisionPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Compass}
      title={t('infoVisionTitle', { defaultValue: 'Mission Winning Vision' })}
      subtitle={t('infoVisionSubtitle', {
        defaultValue:
          'The guiding document for the free global everything app for health. Core mission free for all. Super Bundle for synergy.',
      })}
      footer={<InfoPageFooter showLegal showToday showBundle />}
    >
      <p className="text-muted-foreground">
        <strong className="text-foreground">The #1 Health &quot;Everything App&quot; for the World</strong>
      </p>
      <p className="text-muted-foreground">
        Mission Winning exists to be the entrance to the path — the clear, evidence-based guide to the{' '}
        <em>right way</em> to build lifelong health, strength, resilience, and well-being for every human on Earth.
        It is the alternative to the path of destruction: average habits, excuses, short-term fixes, mediocrity,
        and the slow decline that comes from inconsistent or misguided approaches to the body and mind.
      </p>
      <p className="text-muted-foreground">
        We are building the everything app for health. Not another fragmented tool, but a unified, synergistic
        ecosystem where training, nutrition, mobility, mindfulness, activity tracking, and learning reinforce
        each other. One app. One mission. Accessible to{' '}
        <strong className="text-foreground">everyone, everywhere</strong> — regardless of money, location,
        resources, or background.
      </p>

      <InfoSection title={t('infoVisionCorePromise', { defaultValue: 'Core promise: free forever for the mission' })}>
        <p className="text-muted-foreground">
          The fundamentals that make the world healthier must be available to all, with{' '}
          <strong className="text-foreground">no money barrier</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Workout tracking (the core mission) is 100% free, forever.</li>
          <li>Basic exercise library (bodyweight/minimal-equipment focused, global-friendly).</li>
          <li>Basic nutrition logging and accessible recipes.</li>
          <li>Basic assessments, streaks, challenges, and habit tools.</li>
          <li>Full PWA experience: installable, offline-first, low-data, works on any device/browser anywhere.</li>
        </ul>
        <p className="text-muted-foreground italic">
          &quot;Those with no money should be able to utilize it to track workouts. The core mission should be
          available for everyone in the world.&quot;
        </p>
      </InfoSection>

      <InfoSection title={t('infoVisionSuperApp', { defaultValue: 'The super app structure' })}>
        <p className="text-muted-foreground">
          Inspired by successful freemium + bundle models (notably Freeletics), Mission Winning is structured as
          modular &quot;universes&quot; or pillars. Each route/section is{' '}
          <strong className="text-foreground">accessible</strong> (free entry points and basics for everyone) yet
          serves as a revenue stream through premium layers and the Super Bundle.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">The pillars:</strong> Train (free tracker + premium Coach), Fuel
          (nutrition), Move (mobility + yoga), Mind (mindfulness), Track (activity), Learn (education programs).
        </p>
      </InfoSection>

      <InfoSection title={t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}>
        <p className="text-muted-foreground">
          The flagship offering. One subscription unlocks premium depth across multiple (or all) pillars — &quot;X
          premium tools for the price of 1–2.&quot; Modeled directly on Freeletics: 50% off introductory pricing for
          first 6–12 months, annual discounts, &quot;X apps for the price of 1&quot;.
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground">
        Full details in <code className="text-foreground/80">vision.md</code> in the project root. This page is a
        summary. The app exists to serve this vision.
      </p>
    </InfoPageShell>
  );
}
