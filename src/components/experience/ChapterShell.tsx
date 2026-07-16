import type { ReactNode } from 'react';

type Props = {
  id: string;
  index: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
};

export function ChapterShell({ id, index, eyebrow, children, className }: Props) {
  return (
    <section id={id} className={`xp-chapter ${className ?? ''}`.trim()} data-chapter={index}>
      <div className="xp-chapter-inner">
        <p className="xp-index">
          {index} · {eyebrow}
        </p>
        {children}
      </div>
    </section>
  );
}
