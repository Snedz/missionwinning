import { CinematicWww } from '@/components/landing/CinematicWww';
import { PrivateTeaserClient } from './PrivateTeaserClient';
import './gate.css';

/** Shared door: gated www and ungated Preview/local `/`. Four N1 scenes. */
export function GateTeaser(props: {
  initialInvite?: string;
  initialNext?: string;
  /** Preview/local: the door is cosmetic. Do not bounce unlock back to `/`. */
  walkOpen?: boolean;
}) {
  return (
    <div className="mw-gate">
      <CinematicWww
        mode="gate"
        door={
          <PrivateTeaserClient
            initialInvite={props.initialInvite}
            initialNext={props.initialNext}
            walkOpen={props.walkOpen === true}
          />
        }
      />
    </div>
  );
}
