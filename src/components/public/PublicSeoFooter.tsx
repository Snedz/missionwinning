import Link from 'next/link';

/** Shared footer links for public SEO surfaces (guide, exercises, compare). */
export function PublicSeoFooter() {
  return (
    <footer className="border-t border-border/60 mt-12">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-5 py-8 text-sm text-muted-foreground">
        <Link href="/guide" className="hover:text-emerald-400 transition-colors">
          Guide
        </Link>
        <span aria-hidden>·</span>
        <Link href="/exercises" className="hover:text-emerald-400 transition-colors">
          Exercises
        </Link>
        <span aria-hidden>·</span>
        <Link href="/paths" className="hover:text-emerald-400 transition-colors">
          Paths
        </Link>
        <span aria-hidden>·</span>
        <Link href="/compare" className="hover:text-emerald-400 transition-colors">
          Compare
        </Link>
        <span aria-hidden>·</span>
        <Link href="/welcome" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400/90">
          Start free
        </Link>
      </nav>
    </footer>
  );
}
