import Link from 'next/link';

// Modernist 404 (Error Pages.dc.html): flush-left, ruled, calm — the data is safe.
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="eyebrow-live mb-4">404 — Off the map</p>
        <h1 className="display-section mb-3">This route doesn&apos;t exist.</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          The page may have moved, or the link was mistyped. Your training is exactly where you
          left it.
        </p>
        <div className="flex flex-col gap-3 border-t-2 border-border pt-6 sm:flex-row">
          <Link href="/log" className="primary-action sm:w-auto sm:px-8">
            Go to Today
          </Link>
          <Link
            href="/"
            className="tap-target inline-flex items-center justify-start border-2 border-foreground px-8 text-sm font-semibold hover:bg-foreground/[0.07]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
