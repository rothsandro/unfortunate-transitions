import type { ReactNode } from 'react';
import type { StateValue } from 'xstate';

export interface ActorCardProps {
  archetype: string;
  emoji: string;
  name: string;
  state: StateValue;
  children?: ReactNode;
}

export function ActorCard(props: ActorCardProps) {
  const { archetype, emoji, name, state, children } = props;

  return (
    <div
      className="rounded-xl bg-radial from-slate-800/75 to-slate-900/40 p-6 text-center
        transition-colors duration-300 hover:from-slate-800/90 hover:to-slate-900/50"
    >
      <div className="font-spooky text-sm tracking-wider text-accent uppercase">
        — {archetype} —
      </div>
      <div
        aria-hidden="true"
        className="py-8 text-6xl opacity-90 grayscale-40 transition-transform duration-300
          select-none"
      >
        {emoji}
      </div>
      <div className="font-spooky text-3xl font-semibold tracking-wide">{name}</div>
      <div className="mt-1 font-mono text-sm text-green-500">
        {String(state).replace(/^./, (char) => char.toUpperCase())}
      </div>
      <div className="mt-6 space-y-2">{children}</div>
    </div>
  );
}
