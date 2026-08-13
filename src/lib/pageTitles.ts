/**
 * Route titles without Lucide icons — for AppHeader cold path.
 */

export const STATIC_PAGE_TITLES: Record<string, { label: string; labelKey?: string }> = {
  '/about': { label: 'About', labelKey: 'about' },
  '/terms': { label: 'Terms', labelKey: 'termsOfService' },
  '/privacy': { label: 'Privacy', labelKey: 'privacyPolicy' },
  '/dmca': { label: 'DMCA', labelKey: 'infoDmcaTitle' },
  '/refunds': { label: 'Refunds', labelKey: 'infoRefundsTitle' },
  '/vision': { label: 'Vision', labelKey: 'infoVisionTitle' },
  '/feedback': { label: 'Feedback', labelKey: 'feedback' },
  '/beta': { label: 'Beta guide', labelKey: 'navBetaGuide' },
  '/programs': { label: 'Programs', labelKey: 'infoProgramsTitle' },
  '/coaching': { label: 'Talk to a human coach', labelKey: 'infoCoachingTitle' },
  '/america': { label: 'National fitness', labelKey: 'americaHeroTitle' },
  '/calculators': { label: 'Calculators', labelKey: 'calcTitle' },
  '/explore': { label: 'Explore', labelKey: 'navExplore' },
  '/welcome': { label: 'Welcome', labelKey: 'welcomeTitle' },
  '/fitness-test': { label: 'Fitness test', labelKey: 'pftPageTitle' },
  '/learn/guide': { label: 'Guidebook', labelKey: 'guidebookTitle' },
  '/assessments': { label: 'Health screen', labelKey: 'assessTitle' },
};

/** href → label for primary + extended routes (no icons). */
export const ROUTE_LABELS: { href: string; label: string; labelKey: string }[] = [
  { href: '/log', labelKey: 'navToday', label: 'Today' },
  { href: '/active', labelKey: 'navTrain', label: 'Train' },
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel' },
  { href: '/track', labelKey: 'navTrack', label: 'Track' },
  { href: '/profile', labelKey: 'navYou', label: 'You' },
  { href: '/account', labelKey: 'navAccount', label: 'Account' },
  { href: '/move', labelKey: 'navMove', label: 'Move' },
  { href: '/mind', labelKey: 'navMind', label: 'Mind' },
  { href: '/learn', labelKey: 'navLearn', label: 'Learn' },
  { href: '/learn/guide', labelKey: 'navGuidebook', label: 'Guidebook' },
  { href: '/builder', labelKey: 'navBuilder', label: 'Builder' },
  { href: '/coach', labelKey: 'navCoach', label: 'AI weekly plan' },
  { href: '/library', labelKey: 'navLibrary', label: 'Library' },
  { href: '/history', labelKey: 'navHistory', label: 'History' },
  { href: '/leaderboard', labelKey: 'navLeaderboard', label: 'Leaderboard' },
  { href: '/benchmarks', labelKey: 'navReadiness', label: 'Readiness tests' },
  { href: '/assessments', labelKey: 'navHealth', label: 'Health screen' },
  { href: '/calculators', labelKey: 'navCalculators', label: 'Calculators' },
  { href: '/explore', labelKey: 'navExplore', label: 'Explore' },
  { href: '/bundle', labelKey: 'navBundle', label: 'Super Bundle' },
];

export function pageTitleForPath(pathname: string): string {
  const normalized = pathname === '/' ? '/log' : pathname;
  const staticTitle = STATIC_PAGE_TITLES[normalized];
  if (staticTitle) return staticTitle.label;
  if (normalized.startsWith('/learn/guide/')) {
    return STATIC_PAGE_TITLES['/learn/guide']?.label ?? 'Guidebook';
  }
  const match = ROUTE_LABELS.find(
    (n) => normalized === n.href || normalized.startsWith(n.href + '/')
  );
  return match?.label ?? 'Mission Winning';
}
