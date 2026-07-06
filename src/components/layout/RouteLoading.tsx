/** Lightweight shell while a code-split route chunk loads. */
export function RouteLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Loading {label}…</p>
    </div>
  );
}
