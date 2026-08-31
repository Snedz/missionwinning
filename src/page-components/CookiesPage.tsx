'use client';
/**
 * Page: /cookies — leftover cookie & device-storage inventory.
 * Quiet Account / legal door. Never a rail.
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Renders `STORAGE_INVENTORY` (src/lib/cookiePolicy.ts) — data, not prose, so
 * the guard test can cross-check every named key against the storage registries.
 * Row copy is English-only by design (technical inventory, same posture as the
 * rest of the legal bodies); page chrome goes through i18n.
 */

import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { PRIVACY_DISPLAY_DATE } from '@/lib/privacyConsent';
import { STORAGE_INVENTORY, type StorageCategory, type StorageEntryKind } from '@/lib/cookiePolicy';

export function CookiesPage() {
  const { t } = useTranslation();

  const categoryLabel: Record<StorageCategory, string> = {
    necessary: t('infoCookiesCatNecessary', { defaultValue: 'Strictly necessary' }),
    functional: t('infoCookiesCatFunctional', { defaultValue: 'Functional (local-first)' }),
    consent: t('infoCookiesCatConsent', { defaultValue: 'Only with your consent' }),
  };
  const kindLabel: Record<StorageEntryKind, string> = {
    cookie: t('infoCookiesKindCookie', { defaultValue: 'Cookie' }),
    localStorage: t('infoCookiesKindLocal', { defaultValue: 'Local storage' }),
  };

  return (
    <InfoPageShell
      className="house-cookies"
      icon={Cookie}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoCookiesTitle', { defaultValue: 'Cookies & device storage' })}
      lastUpdated={`${t('infoLastUpdatedLabel', { defaultValue: 'Last updated:' })} ${PRIVACY_DISPLAY_DATE}`}
    >
      {/* Quiet leftover: overview + inventory stay first paint. */}
      <section id="overview" className="house-card space-y-3">
        <h2 className="font-semibold">{t('infoCookiesOverview', { defaultValue: 'Overview' })}</h2>
        <p className="text-sm text-muted-foreground">
          {t('infoCookiesOverviewBody', {
            defaultValue:
              'Mission Winning stores as little as possible in your browser, and nothing for advertising. Sign-in uses strictly necessary httpOnly cookies; your app data lives in local storage on your device and leaves it only when you sign in to sync. This page lists every cookie and storage key we set.',
          })}
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            {t('infoCookiesNoAdsLi', {
              defaultValue:
                'No advertising cookies, no third-party tracking pixels, no session recording — ever.',
            })}
          </li>
          <li>
            {t('infoCookiesDntLi', {
              defaultValue:
                'Do Not Track is honored: analytics stay off and the consent banner never shows.',
            })}
          </li>
          <li>
            {t('infoCookiesLocaleLi', {
              defaultValue:
                'mw_locale and mw_country are strictly necessary first-party cookies. Language is a display preference; country follows the hosted-service geo-block in supportedRegions.ts. Counsel should review this inventory before a public flip — this page does not rewrite the Privacy or Terms bodies.',
            })}
          </li>
          <li>
            {t('infoCookiesManageLi', {
              defaultValue:
                'Change your analytics choice anytime in Profile → Privacy & analytics; clear site data in your browser to remove everything local.',
            })}
          </li>
        </ul>
      </section>

      <section id="inventory" className="house-card space-y-3">
        <h2 className="font-semibold">
          {t('infoCookiesInventory', { defaultValue: 'Full inventory' })}
        </h2>
        {/* A horizontal-scroll region must be keyboard-reachable (axe
            scrollable-region-focusable): tabIndex puts it in the tab order so
            arrow keys can pan the table without a pointer. */}
        <div
          className="overflow-x-auto"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable
          tabIndex={0}
          role="region"
          aria-label={t('infoCookiesInventory', { defaultValue: 'Full inventory' })}
        >
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  {t('infoCookiesColName', { defaultValue: 'Name' })}
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  {t('infoCookiesColKind', { defaultValue: 'Type' })}
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  {t('infoCookiesColCategory', { defaultValue: 'Category' })}
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  {t('infoCookiesColPurpose', { defaultValue: 'Purpose' })}
                </th>
                <th scope="col" className="py-2 font-semibold">
                  {t('infoCookiesColRetention', { defaultValue: 'Retention' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {STORAGE_INVENTORY.map((entry) => (
                <tr key={entry.name} className="align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{entry.name}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                    {kindLabel[entry.kind]}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                    {categoryLabel[entry.category]}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{entry.purpose}</td>
                  <td className="py-2 text-muted-foreground">{entry.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </InfoPageShell>
  );
}
