import type { AssessmentRecord } from '@/lib/pathfinderAssessment';

export type VillageHealthCardInput = {
  assessment: AssessmentRecord & { recommendations?: string[] };
  workoutCount: number;
  lastWorkoutName?: string;
  streak?: number;
  trainLocation?: string | null;
};

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Printable Village Health Card — share with CHW or clinic when care is available. */
export function formatVillageHealthCardHtml(input: VillageHealthCardInput): string {
  const { assessment, workoutCount, lastWorkoutName, streak = 0, trainLocation } = input;
  const generated = new Date().toLocaleString();
  const recs = (assessment as { recommendations?: string[] }).recommendations ?? [];

  const recList =
    recs.length === 0
      ? '<li class="muted">Complete assessment for personalized starters.</li>'
      : recs.map((r) => `<li>${escapeHtml(r)}</li>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Mission Winning — Village Health Card</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; color: #111; line-height: 1.5; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    .meta { color: #555; font-size: 0.875rem; margin-bottom: 1.25rem; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 1rem 0; }
    .cell { border: 1px solid #ccc; border-radius: 8px; padding: 0.75rem; }
    .cell strong { display: block; font-size: 1.25rem; }
    ul { padding-left: 1.25rem; }
    .warn { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.75rem; font-size: 0.875rem; margin: 1rem 0; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #666; }
    .muted { color: #666; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  <h1>Village Health Card</h1>
  <p class="meta">Mission Winning · Generated ${escapeHtml(generated)}</p>
  ${assessment.pathfinderTrack ? '<p><span class="badge">Pathfinder track</span></p>' : ''}
  <div class="grid">
    <div class="cell"><strong>${escapeHtml(assessment.risk.toUpperCase())}</strong>Assessment risk</div>
    <div class="cell"><strong>${escapeHtml(assessment.date)}</strong>Assessment date</div>
    <div class="cell"><strong>${workoutCount}</strong>Workouts logged</div>
    <div class="cell"><strong>${streak}</strong>Day streak</div>
  </div>
  ${trainLocation ? `<p><strong>Train location:</strong> ${escapeHtml(trainLocation)}</p>` : ''}
  ${lastWorkoutName ? `<p><strong>Last workout:</strong> ${escapeHtml(lastWorkoutName)}</p>` : ''}
  <p>${escapeHtml(assessment.notes)}</p>
  <h2>Recommended next steps</h2>
  <ul>${recList}</ul>
  <div class="warn">
    <strong>Not medical advice.</strong> Educational fitness tool only. Seek urgent care if you have chest pain,
    fainting, or severe symptoms — when emergency services or a clinic are available.
  </div>
  <p class="footer">Mission Winning LLC — free global health app. Bring this card when you can reach a health worker or clinic.</p>
</body>
</html>`;
}

export function openVillageHealthCard(input: VillageHealthCardInput): void {
  const html = formatVillageHealthCardHtml(input);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
