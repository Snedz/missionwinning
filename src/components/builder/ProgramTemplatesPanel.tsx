import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  type ProgramCategory,
  type ProgramSession,
  type ProgramTemplate,
} from "@/data/programTemplates";

export const TEMPLATE_PROGRAM_COUNT = PROGRAM_TEMPLATES.length;

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
  if (programs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No programs in this category.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div
          key={program.id}
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-base">{program.name}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{program.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline">{program.duration}</Badge>
                <Badge variant="muscle">{program.focus}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {onViewDetails && (
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(program)}>
                  Details
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => onSaveAllSessions(program)}>
                Save all ({program.sessions.length})
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {program.sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{session.name}</p>
                  {session.weekLabel && (
                    <p className="text-xs text-muted-foreground">{session.weekLabel}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {session.exercises.length} exercises ·{" "}
                    {session.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                  </p>
                </div>
                <Button size="sm" variant="fitness" onClick={() => onLoadSession(program, session)}>
                  Load
                </Button>
              </div>
            ))}
          </div>
        </div>
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
  const [quickPick, setQuickPick] = useState("");
  const programs = getProgramsByCategory(category);
  const categoryMeta = PROGRAM_CATEGORIES.find((c) => c.id === category)!;

  const quickOptions = useMemo(
    () =>
      PROGRAM_TEMPLATES.flatMap((program) =>
        program.sessions.map((session) => ({
          value: `${program.id}::${session.id}`,
          program,
          session,
        }))
      ),
    []
  );

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
      <div className="rounded-xl border border-dashed border-destructive/50 bg-destructive/10 p-6 text-center text-sm">
        Template data failed to load. Restart the dev server.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{categoryMeta.description}</p>
      <ProgramList
        programs={programs}
        onLoadSession={onLoadSession}
        onSaveAllSessions={onSaveAllSessions}
        onViewDetails={onViewDetails}
      />

      <div className="rounded-lg border border-border bg-background/80 p-4 space-y-3">
        <Label className="text-foreground font-medium">Quick load (all categories)</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={quickPick} onValueChange={setQuickPick}>
            <SelectTrigger className="flex-1 bg-background">
              <SelectValue placeholder="Choose program & session..." />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {PROGRAM_CATEGORIES.map((cat) => {
                const catPrograms = getProgramsByCategory(cat.id);
                if (catPrograms.length === 0) return null;
                return (
                  <SelectGroup key={cat.id}>
                    <SelectLabel>{cat.label}</SelectLabel>
                    {catPrograms.flatMap((program) =>
                      program.sessions.map((session) => (
                        <SelectItem
                          key={`${program.id}-${session.id}`}
                          value={`${program.id}::${session.id}`}
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
          <Button variant="fitness" onClick={handleQuickLoad} disabled={!quickPick}>
            Load into builder
          </Button>
        </div>
      </div>
    </div>
  );
}
