export interface GuidePracticeCTA {
  label: string;
  href: string;
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
