import { PrivateTeaserClient } from './PrivateTeaserClient';
import './gate.css';

/** Shared door: gated www and ungated Preview/local `/`. */
export function GateTeaser(props: { initialInvite?: string; initialNext?: string }) {
  return (
    <div className="mw-gate">
      <PrivateTeaserClient initialInvite={props.initialInvite} initialNext={props.initialNext} />
    </div>
  );
}
