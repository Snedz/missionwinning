import { PrivateTeaserClient } from './PrivateTeaserClient';
import '@/components/house/house.css';
import './gate.css';

/** Shared door: gated www and ungated Preview/local `/`. Tight lock. */
export function GateTeaser(props: {
  initialInvite?: string;
  initialNext?: string;
  /** UI only: open the access-code details (arrived from /beta). */
  codeOpen?: boolean;
  /** Preview/local: the door is cosmetic. Do not bounce unlock back to `/`. */
  walkOpen?: boolean;
}) {
  return (
    <div className="mw-house mw-gate">
      <PrivateTeaserClient
        initialInvite={props.initialInvite}
        initialNext={props.initialNext}
        codeOpen={props.codeOpen === true}
        walkOpen={props.walkOpen === true}
      />
    </div>
  );
}
