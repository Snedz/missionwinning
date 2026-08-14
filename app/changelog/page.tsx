import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seoMetadata";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { ChangelogPage } from "@/page-components/ChangelogPage";
import { APP_PUBLIC_PRODUCT_VERSION } from "@/lib/buildInfo";
import { latestChangelogEntry } from "@/data/changelog";

const latest = latestChangelogEntry();

export const metadata: Metadata = publicPageMetadata({
  title: `Changelog · ${APP_PUBLIC_PRODUCT_VERSION}`,
  description: `The latest fixes, features, and improvements shipping to Mission Winning. Latest v${latest.version}.`,
  path: "/changelog",
});

export default function ChangelogRoute() {
  return (
    <PublicPageShell
      eyebrow="Changelog"
      title="Changelog"
      subtitle="The latest fixes, features, and improvements shipping to Mission Winning."
    >
      <ChangelogPage />
    </PublicPageShell>
  );
}
