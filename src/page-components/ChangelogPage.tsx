import {
  CHANGELOG_ENTRIES,
  formatChangelogDate,
  latestChangelogEntry,
} from "@/data/changelog";

export function ChangelogPage() {
  const latest = latestChangelogEntry();
  return (
    <div className="space-y-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Latest v{latest.version} · {formatChangelogDate(latest.date)}
      </p>
      <ol className="space-y-14">
        {CHANGELOG_ENTRIES.map((entry) => (
          <li
            key={entry.version}
            className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-10"
          >
            <p className="section-index sm:pt-1">{formatChangelogDate(entry.date)}</p>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                v{entry.version}
              </p>
              <h2 className="display-section max-w-[22ch] text-balance text-foreground">
                {entry.title}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">{entry.lead}</p>
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
