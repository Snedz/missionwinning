# Destructive UX — hold-to-confirm delete language

**Not a dialog manifesto.** Destructive actions are a design language. Follow these rules before shipping a delete control.

## Rules

1. **Ring = confirmation.** Hold ~300ms; a progress ring fills. Release early → the action never fires. No “Are you sure? Yes” that nobody reads.
2. **Name the verb.** Labels are warnings: “Discard workout”, “Clear today’s meals”, “Delete meal entry” — not “Confirm” / “OK” / “Delete”.
3. **Geography is friction.** Destructive controls never sit where primary Confirm/Finish lives. Prefer last position, Danger zone, or far from the fitness CTA.
4. **Red is a budget.** Spend `destructive` on destruction only. Sign Out stays outline — a red logout cries wolf.
5. **Time is the last line of defense.** For irreversible account wipe later: schedule + cancel window (e.g. 14 days). Not built in-app yet.

## Components

| Component | Path |
|-----------|------|
| `HoldToConfirmButton` | [`src/components/ui/HoldToConfirmButton.tsx`](../src/components/ui/HoldToConfirmButton.tsx) |
| `DangerZone` | [`src/components/ui/DangerZone.tsx`](../src/components/ui/DangerZone.tsx) |
| Helpers | [`src/lib/holdToConfirm.ts`](../src/lib/holdToConfirm.ts) |

```tsx
<HoldToConfirmButton
  label="Discard workout"
  onConfirm={discard}
/>

<DangerZone description="Clears every meal logged today.">
  <HoldToConfirmButton label="Clear today’s meals" onConfirm={clear} size="sm" />
</DangerZone>
```

- **Pointer:** hold to confirm; leave/cancel aborts.
- **Keyboard:** first Enter/Space arms; second within 2s confirms (screen-reader friendly).

## Anti-patterns

- `window.confirm` / AlertDialog “Are you sure?”
- Red primary “Confirm” next to Finish
- Instant trash on irreversible cloud data without hold
- Red Sign Out / soft secondary actions

## Future

Account deletion cooldown + cancel email — when we ship in-app delete account.
