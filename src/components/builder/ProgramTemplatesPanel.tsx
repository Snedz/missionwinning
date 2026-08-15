'use client';

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, LayoutList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROGRAM_CATEGORIES,
  PROGRAM_TEMPLATES,
  getProgramsByCategory,
  getProgramTags,
  type ProgramCategory,
  type ProgramSession,
  type ProgramTemplate,
} from "@/data/programTemplates";
import { PROGRAM_TAG_LABELS } from "@/data/exerciseEnrichment";
import type { ProgramTag } from "@/types";
import { usePremium } from "@/hooks/usePremium";
import Link from "next/link";
import { isFreeBeta } from "@/lib/freeBeta";

export const TEMPLATE_PROGRAM_COUNT = PROGRAM_TEMPLATES.length;
/** Pro templates are server-only — fetched via /api/premium/programs when premium. */
export const FREE_TEMPLATE_PROGRAM_COUNT = TEMPLATE_PROGRAM_COUNT;

interface ProgramTemplatesPanelProps {
  category: ProgramCategory;
  onLoadSession: (program: ProgramTemplate, session: ProgramSession) => void;
  onSaveAllSessions: (program: ProgramTemplate) => void;
  onViewDetails?: (program: ProgramTemplate) => void;
}

function ProgramList({
  programs,
  onLoadSession,
  onSaveAllSessions,
  onViewDetails,
}: {
  programs: ProgramTemplate[];
  onLoadSession: (program: ProgramTemplate, session: ProgramSession) => void;
  onSaveAllSessions: (program: ProgramTemplate) => void;
  onViewDetails?: (program: ProgramTemplate) => void;
}) {
  const { t } = useTranslation();

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={LayoutList}
        title={t('builderNoPrograms', { defaultValue: 'No programs in this category.' })}
        description={t('builderNoProgramsHint', {
          defaultValue: 'Pick another category, or log a session from scratch.',
        })}
        actionLabel={t('builderNoProgramsAction', { defaultValue: 'Log a session' })}
        href="/active"
      />
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => (
        <details key={program.id}
          className="group  border border-border bg-card"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-2 p-4 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <div className="min-w-0 text-left">
              <h4 className="font-semibold text-base">{program.name}</h4>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{program.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline">{program.duration}</Badge>
                <Badge variant="muscle">{program.focus}</Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {t('builderSessionCount', {
                    count: program.sessions.length,
                    defaultValue: `${program.sessions.length} sessions`,
                  })}
                </Badge>
                {getProgramTags(program).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {PROGRAM_TAG_LABELS[tag]}
                  </Badge>
                ))}
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 mt-1 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              {onViewDetails && (
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(program)}>
                  {t('builderDetails', { defaultValue: 'Details' })}
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => onSaveAllSessions(program)}>
                {t('builderSaveAll', {
                  count: program.sessions.length,
                  defaultValue: `Save all (${program.sessions.length})`,
                })}
              </Button>
            </div>
            <div className="space-y-2">
              {program.sessions.map((session) => (
                <div key={session.id}
                  className="flex flex-wrap items-center justify-between gap-2  border-2 border-border bg-card px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{session.name}</p>
                    {session.weekLabel && (
                      <p className="text-xs text-muted-foreground">{session.weekLabel}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('builderSessionMeta', {
                        exercises: session.exercises.length,
                        sets: session.exercises.reduce((n, e) => n + e.sets.length, 0),
                        defaultValue: `${session.exercises.length} exercises · ${session.exercises.reduce((n, e) => n + e.sets.length, 0)} sets`,
                      })}
                    </p>
                  </div>
                  <Button size="sm" variant="default" onClick={() => onLoadSession(program, session)}>
                    {t('builderLoad', { defaultValue: 'Load' })}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

export function ProgramTemplatesPanel({
  category,
  onLoadSession,
  onSaveAllSessions,
  onViewDetails,
}: ProgramTemplatesPanelProps) {
  const { t } = useTranslation();
  const [quickPick, setQuickPick] = useState("");
  const [tagFilter, setTagFilter] = useState<ProgramTag | "">("");
  const [search, setSearch] = useState("");
  const { premium, loading: premiumLoading } = usePremium();
  const [proPrograms, setProPrograms] = useState<ProgramTemplate[]>([]);
  const [proLoadError, setProLoadError] = useState(false);

  useEffect(() => {
    if (!premium) {
      setProPrograms([]);
      setProLoadError(false);
      return;
    }
    setProLoadError(false);
    fetch("/api/premium/programs?category=pro", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("pro programs failed");
        return r.json();
      })
      .then((data) => setProPrograms(data.programs ?? []))
      .catch(() => {
        setProPrograms([]);
        setProLoadError(true);
      });
  }, [premium]);

  const basePrograms =
    category === "pro"
      ? premium
        ? proPrograms
        : []
      : getProgramsByCategory(category);

  const programs = basePrograms.filter((p) => {
    if (tagFilter && !getProgramTags(p).includes(tagFilter)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) return true;
    return p.sessions.some((s) => s.name.toLowerCase().includes(q));
  });
  // `?? PROGRAM_CATEGORIES[0]`, not `!`: the assertion was dereferenced unguarded
  // at `categoryMeta.description` below, so a category id outgrowing the catalog
  // threw on the render path rather than falling back to a real category.
  const categoryMeta =
    PROGRAM_CATEGORIES.find((c) => c.id === category) ?? PROGRAM_CATEGORIES[0];

  const quickOptions = useMemo(() => {
    const source =
      premium && proPrograms.length > 0
        ? [...PROGRAM_TEMPLATES, ...proPrograms]
        : PROGRAM_TEMPLATES;

    return source.flatMap((program) =>
      program.sessions.map((session) => ({
        value: `${program.id}::${session.id}`,
        program,
        session,
      }))
    );
  }, [premium, proPrograms]);

  const handleQuickLoad = () => {
    if (!quickPick) return;
    const option = quickOptions.find((o) => o.value === quickPick);
    if (option) {
      onLoadSession(option.program, option.session);
      setQuickPick("");
    }
  };

  if (PROGRAM_TEMPLATES.length === 0) {
    return (
      <div className="border-2 border-primary bg-muted p-6 text-center text-sm">
        {t('builderTemplateLoadFail', {
          defaultValue: 'Template data failed to load. Restart the dev server.',
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proLoadError && category === 'pro' && premium ? (
        <div role="alert"
          className="border-2 border-primary bg-muted p-4 text-sm space-y-2"
        >
          <p>
            {typeof navigator !== 'undefined' && !navigator.onLine
              ? isFreeBeta()
                ? t('builderProOfflineOpenBeta', {
                    defaultValue:
                      'Offline — pro program list will load when you reconnect. Free templates still work.',
                  })
                : t('builderProOffline', {
                    defaultValue:
                      'Offline — premium program list will load when you reconnect.',
                  })
              : isFreeBeta()
                ? t('builderProLoadFailOpenBeta', {
                    defaultValue:
                      'Could not load pro programs. Try again — free templates still work.',
                  })
                : t('builderProLoadFail', {
                    defaultValue: 'Could not load premium programs. Try again.',
                  })}
          </p>
          <button type="button"
            className="text-primary text-sm underline min-h-[44px]"
            onClick={() => {
              setProLoadError(false);
              fetch('/api/premium/programs?category=pro', { credentials: 'include' })
                .then((r) => {
                  if (!r.ok) throw new Error('fail');
                  return r.json();
                })
                .then((data) => setProPrograms(data.programs ?? []))
                .catch(() => setProLoadError(true));
            }}
          >
            {t('retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">{categoryMeta.description}</p>
      <Input type="search" value={search}
        onChange={(e) => setSearch(e.target.value)} placeholder={t('builderTemplateSearch', {
          defaultValue: 'Search programs or sessions…',
        })}
        className="bg-background"
      />
      {search.trim() && (
        <p className="text-xs text-muted-foreground">
          {t('builderTemplateSearchCount', {
            count: programs.length,
            defaultValue: `${programs.length} matching`,
          })}
        </p>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">
          {t('builderStyleFilter', { defaultValue: 'Style:' })}
        </span>
        {(["", "strength", "hypertrophy", "conditioning", "corrective"] as const).map((tag) => (
          <Button key={tag || "all"} size="sm" variant={tagFilter === tag ? "selected" : "outline"}
            className="h-7 text-xs"
            onClick={() => setTagFilter(tag)}
          >
            {tag ? PROGRAM_TAG_LABELS[tag] : t('builderFilterAll', { defaultValue: 'All' })}
          </Button>
        ))}
      </div>
      {category === "pro" && !premiumLoading && !premium && !isFreeBeta() && (
        <div className="border-2 border-border bg-card p-4 text-sm">
          {t('builderProPremium', { defaultValue: 'Pro cycles require Super Bundle premium.' })}{' '}
          <Link href="/bundle" className="underline text-primary">
            {t('builderUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}
          </Link>
        </div>
      )}
      {category === "pro" && !premiumLoading && !premium && isFreeBeta() && (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">
          {t('builderProFreeBeta', {
            defaultValue: 'Pro cycles are paused during Alpha — free templates stay available.',
          })}
        </div>
      )}
      <ProgramList programs={programs}
        onLoadSession={onLoadSession}
        onSaveAllSessions={onSaveAllSessions}
        onViewDetails={onViewDetails}
      />

      <div className="border border-border bg-background p-4 space-y-3">
        <Label className="text-foreground font-medium">
          {t('builderQuickLoadLabel', { defaultValue: 'Quick load (all categories)' })}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={quickPick} onValueChange={setQuickPick}>
            {/* Radix renders the trigger as a button; a placeholder is not an
                accessible name, so unselected it announced nothing. */}
            <SelectTrigger
              className="flex-1 bg-background"
              aria-label={t('builderQuickLoadLabel', {
                defaultValue: 'Quick load (all categories)',
              })}
            >
              <SelectValue placeholder={t('builderQuickLoadPlaceholder', {
                  defaultValue: 'Choose program & session…',
                })}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {PROGRAM_CATEGORIES.map((cat) => {
                const catPrograms =
                  cat.id === "pro"
                    ? premium
                      ? proPrograms
                      : []
                    : getProgramsByCategory(cat.id);
                if (catPrograms.length === 0) return null;
                return (
                  <SelectGroup key={cat.id}>
                    <SelectLabel>{cat.label}</SelectLabel>
                    {catPrograms.flatMap((program, pi) =>
                      program.sessions.map((session, si) => (
                        <SelectItem key={`${cat.id}-${program.id}-${session.id}-${pi}-${si}`} value={`${program.id}::${session.id}`}
                        >
                          {program.name} — {session.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleQuickLoad} disabled={!quickPick}>
            {t('builderQuickLoadButton', { defaultValue: 'Load into builder' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
