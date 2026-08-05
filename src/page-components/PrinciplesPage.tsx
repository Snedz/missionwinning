'use client';
/**
 * Page: /principles — fair-by-sex standards + women-friendly product commitments
 * See: app/INDEX.md, docs/brand-guidelines.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

export function PrinciplesPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Scale}
      eyebrow={t('principlesEyebrow', { defaultValue: 'Principles' })}
      title={t('infoPrinciplesTitle', { defaultValue: 'Fair categories & standards' })}
      subtitle={t('infoPrinciplesSubtitle', {
        defaultValue:
          'Every athlete is welcome. Where performance standards and fair comparison matter, we use sex — male and female.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="content-card">
        <CardContent className="pt-6 space-y-6 text-sm leading-relaxed">
          <InfoSection
            title={t('infoPrinciplesServe', { defaultValue: 'Who we serve' })}
          >
            <p className="text-muted-foreground">
              {t('infoPrinciplesServeBody', {
                defaultValue:
                  'Mission Winning serves every athlete — free offline logging, Mission Coach from your logs, no wearable required. Men and women train here with equal product quality. We do not run a women-only app or a men-only app.',
              })}
            </p>
          </InfoSection>

          <InfoSection
            title={t('infoPrinciplesSex', {
              defaultValue: 'Sex-based standards',
            })}
          >
            <p className="text-muted-foreground">
              {t('infoPrinciplesSexBody', {
                defaultValue:
                  'Fuel math (BMR), strength standards ladders, and Presidential Fitness–style bands use biological sex: male or female. That is how honest population standards work. We label the input Sex, not gender, because these tools score physiology and performance conventions — not identity.',
              })}
            </p>
            <p className="text-muted-foreground">
              {t('infoPrinciplesSexBody2', {
                defaultValue:
                  'We do not silently assume male. Set sex once in Profile (or when a tool asks) so female athletes are scored on female standards without re-picking every screen.',
              })}
            </p>
          </InfoSection>

          <InfoSection
            title={t('infoPrinciplesSport', {
              defaultValue: 'Fair competition in sport',
            })}
          >
            <p className="text-muted-foreground">
              {t('infoPrinciplesSportBody', {
                defaultValue:
                  'Women’s sport categories exist so female athletes can compete fairly. Mission Winning is a personal training coach, not a league registrar — but we align with that principle: performance tools and school fitness bands keep male and female standards separate. No men in women’s standards categories.',
              })}
            </p>
          </InfoSection>

          <InfoSection
            title={t('infoPrinciplesWomen', {
              defaultValue: 'Women-friendly product commitments',
            })}
          >
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t('infoPrinciplesWomenLi1', {
                  defaultValue:
                    'Female strength ladders, PE bands, and fuel math are first-class — not an afterthought.',
                })}
              </li>
              <li>
                {t('infoPrinciplesWomenLi2', {
                  defaultValue:
                    'No silent male default that mis-scores women who never touch a sex picker.',
                })}
              </li>
              <li>
                {t('infoPrinciplesWomenLi3', {
                  defaultValue:
                    'Optional cycle-aware coaching cues (when enabled) are educational only — never a diagnosis, never a gate on free logging.',
                })}
              </li>
              <li>
                {t('infoPrinciplesWomenLi4', {
                  defaultValue:
                    'Copy and examples treat female athletes as athletes, not a pink niche.',
                })}
              </li>
            </ul>
          </InfoSection>

          <InfoSection
            title={t('infoPrinciplesBoundary', {
              defaultValue: 'Educational boundary',
            })}
          >
            <p className="text-muted-foreground">
              {t('infoPrinciplesBoundaryBody', {
                defaultValue:
                  'Mission Winning is educational fitness tooling and adaptive coaching support — not medical care, not clinical hormone treatment, and not a substitute for a qualified clinician. Always clear new training or nutrition plans with a professional when needed.',
              })}
            </p>
          </InfoSection>

          <InfoSection title={t('infoPrinciplesMore', { defaultValue: 'More' })}>
            <p className="text-muted-foreground">
              <Link href="/about" className="text-primary hover:underline">
                {t('about', { defaultValue: 'About' })}
              </Link>
              {' · '}
              <Link href="/privacy" className="text-primary hover:underline">
                {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
              </Link>
              {' · '}
              <Link href="/vision" className="text-primary hover:underline">
                {t('infoVisionTitle', { defaultValue: 'Vision' })}
              </Link>
              {' · '}
              <Link href="/fitness-test" className="text-primary hover:underline">
                {t('navFitnessTest', { defaultValue: 'Fitness test' })}
              </Link>
            </p>
          </InfoSection>
        </CardContent>
      </Card>
    </InfoPageShell>
  );
}
