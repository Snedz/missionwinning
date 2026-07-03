import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="content-card w-full max-w-md p-8 text-center">
        <p className="eyebrow mb-4">404 — Off the map</p>
        <h1 className="font-display mb-3 text-3xl font-semibold uppercase leading-none">
          This route doesn&apos;t exist.
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          The page may have moved, or the link was mistyped. Your training is exactly where you
          left it.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/log" className="primary-action sm:w-auto sm:px-8">
            Go to Today
          </Link>
          <Link
            href="/"
            className="tap-target inline-flex items-center justify-center rounded-2xl border border-border px-8 text-sm font-medium hover:bg-secondary"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
