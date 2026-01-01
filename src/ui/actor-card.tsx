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
        transition-colors duration-300 select-none hover:from-slate-800/90 hover:to-slate-900/50"
    >
      <div className="font-spooky text-sm tracking-wider text-accent uppercase">
        — {archetype} —
      </div>
      <div
        aria-hidden="true"
        className="py-8 text-6xl opacity-90 grayscale-40 transition-transform duration-300
          select-none text-shadow-[0_0_1px_#fff,0_0_20px_rgba(255,255,255,0.1)]"
      >
        {emoji}
      </div>
      <div
        className={clsx(
          'tracking-wid font-spooky text-3xl font-semibold',
          stateType === 'terminal' && 'text-slate-400 line-through decoration-slate-200',
        )}
      >
        {name}
      </div>
      <div
        className={clsx(
          'mt-3 inline-block rounded-full px-3 py-1 font-mono text-sm',
          !stateType && 'bg-white/10 text-white',
          stateType === 'spooky' && 'bg-cyan-400/10 text-cyan-400',
          stateType === 'active' && 'bg-amber-400/10 text-amber-400',
          stateType === 'passive' && 'bg-slate-400/10 text-slate-400',
          stateType === 'danger' && 'bg-red-500/10 text-red-400',
          stateType === 'terminal' && 'bg-slate-500/10 text-slate-500',
        )}
      >
        {camelCaseToWords(String(state))}
      </div>
      <div className="mt-6 space-y-2">{children}</div>
    </div>
  );
}

function camelCaseToWords(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
