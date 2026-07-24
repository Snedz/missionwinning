import Link from 'next/link';

/** Shared footer links for public SEO surfaces (guide, exercises, compare). */
export function PublicSeoFooter() {
  return (
    <footer className="mt-12 border-t border-border/40">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-5 py-8 text-sm text-muted-foreground">
        <Link href="/guide" className="transition-colors hover:text-primary">
          Guide
        </Link>
        <span aria-hidden>·</span>
        <Link href="/exercises" className="transition-colors hover:text-primary">
          Exercises
        </Link>
        <span aria-hidden>·</span>
        <Link href="/paths" className="transition-colors hover:text-primary">
          Paths
        </Link>
        <span aria-hidden>·</span>
        <Link href="/compare" className="transition-colors hover:text-primary">
          Compare
        </Link>
        <span aria-hidden>·</span>
        <Link
          href="/welcome"
          className="font-medium text-primary/90 transition-colors hover:text-primary"
        >
          Start free
        </Link>
      </nav>
    </footer>
  );
}
