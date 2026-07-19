/**
 * Parse guidebook section body for magazine print (paragraphs + **bold**).
 * Original MW wording only — formatting helper, not new copy.
 */
import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

function inlineBold(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return createElement('strong', { key: `${keyPrefix}-b${i}` }, part.slice(2, -2));
    }
    return createElement(Fragment, { key: `${keyPrefix}-t${i}` }, part);
  });
}

/** Split blank-line paragraphs; render **bold** as <strong>. */
export function renderMagazineBody(body: string): ReactNode {
  const paragraphs = body
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    const children = lines.flatMap((line, li) => {
      const nodes = inlineBold(line, `p${i}-l${li}`);
      if (li < lines.length - 1) {
        return [...nodes, createElement('br', { key: `p${i}-br${li}` })];
      }
      return nodes;
    });
    return createElement('p', { key: `p${i}`, className: 'magazine-body-p' }, ...children);
  });
}
