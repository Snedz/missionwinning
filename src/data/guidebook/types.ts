export interface GuidePracticeCTA {
  label: string;
  href: string;
}

/** Key-idea / watch-out teaching box (magazine + web). */
export interface GuideCallout {
  title: string;
  body: string;
}

/** Comparison / reference table. */
export interface GuideTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

/** Scannable checklist (setup, faults, habits). */
export interface GuideChecklist {
  title: string;
  items: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  /** Paragraphs separated by blank lines in the reader. */
  body: string;
  practiceCTA: GuidePracticeCTA;
  relatedExerciseIds?: string[];
  relatedLearnPathId?: string;
  /** Internal source-topic reference for the originality log — not shown to users. */
  sourceRef?: string;
  /** Optional editorial teaching furniture (v1.3+). */
  callout?: GuideCallout;
  table?: GuideTable;
  checklist?: GuideChecklist;
}

export interface GuideChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  sections: GuideSection[];
  quickPathId?: string;
}
