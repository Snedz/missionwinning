/**
 * Product-as-hero set table for the gated door.
 *
 * Comp B product truth: one logger, paper/ink, SET / LB / REPS / RPE / REST.
 * Static product chrome — not a named athlete, not a testimonial, not speech.
 */

const ROWS = [
  { set: 1, lb: 135, reps: 5, rpe: '7', rest: '2:00' },
  { set: 2, lb: 155, reps: 5, rpe: '7.5', rest: '2:00' },
  { set: 3, lb: 175, reps: 5, rpe: '8', rest: '2:30' },
  { set: 4, lb: 185, reps: 5, rpe: '8.5', rest: '3:00' },
] as const;

export function GateSetTable() {
  return (
    <figure className="gate-set" data-mw-set-table>
      <figcaption className="gate-set-cap">
        <span className="gate-set-kicker">Log set</span>
        <span className="gate-set-lift">Bench press</span>
        <span className="gate-set-target">Target 185 × 5</span>
      </figcaption>
      <table className="gate-set-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Lb</th>
            <th>Reps</th>
            <th>Rpe</th>
            <th>Rest</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.set}>
              <td>{row.set}</td>
              <td>{row.lb}</td>
              <td>{row.reps}</td>
              <td>{row.rpe}</td>
              <td>{row.rest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
