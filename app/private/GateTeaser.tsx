import { PrivateTeaserClient } from './PrivateTeaserClient';
import './gate.css';

/** Shared door: gated www and ungated Preview/local `/`. */
export function GateTeaser(props: {
  initialInvite?: string;
  initialNext?: string;
  /** Preview/local: the door is cosmetic. Do not bounce unlock back to `/`. */
  walkOpen?: boolean;
}) {
  return (
    <div className="mw-gate">
      <PrivateTeaserClient
        initialInvite={props.initialInvite}
        initialNext={props.initialNext}
        walkOpen={props.walkOpen === true}
      />
    </div>
  );
}
