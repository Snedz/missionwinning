/**
 * Whether Today's "Today details" disclosure should mount.
 * One home for the below-fold More gate (.428).
 */
export function shouldAppendTodayMoreDetails(opts: {
  belowFoldReady: boolean;
  showQuickLinks: boolean;
  showDetailsAccordion: boolean;
  spilledCount: number;
}): boolean {
  return (
    opts.belowFoldReady &&
    (opts.showQuickLinks || opts.showDetailsAccordion || opts.spilledCount > 0)
  );
}
