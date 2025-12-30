import clsx from 'clsx';
import type { StateType } from '@/lib/meta';
import type { ReactNode } from 'react';
import type { StateValue } from 'xstate';

export interface ActorCardProps {
  archetype: string;
  emoji: string;
  name: string;
  state: StateValue;
  stateType?: StateType;
  children?: ReactNode;
}

export function ActorCard(props: ActorCardProps) {
  const { archetype, emoji, name, state, stateType, children } = props;

  return (
    <div
      data-state-type={stateType}
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
      <div
        className={clsx(
          'mt-3 inline-block rounded-full px-4 py-1 font-mono text-sm',
          !stateType && 'bg-white/10 text-white',
          stateType === 'inactive' && 'bg-slate-500/10 text-slate-400',
          stateType === 'active' && 'bg-green-500/10 text-green-400',
          stateType === 'negative' && 'bg-red-500/10 text-red-400',
        )}
      >
        {String(state).replace(/^./, (char) => char.toUpperCase())}
      </div>
      <div className="mt-6 space-y-2">{children}</div>
    </div>
  );
}
