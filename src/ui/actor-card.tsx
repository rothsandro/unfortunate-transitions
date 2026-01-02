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
      className="flex items-center gap-7 rounded-xl bg-linear-to-r from-slate-800/75 to-slate-900/40
        p-7 transition-colors duration-300 select-none hover:from-slate-800/90
        hover:to-slate-900/50"
    >
      <div
        aria-hidden="true"
        className="text-5xl grayscale-40 transition-transform duration-300 select-none
          text-shadow-[0_0_1px_#fff,0_0_20px_rgba(255,255,255,0.1)]"
      >
        {emoji}
      </div>
      <div className="grow">
        <div className="font-mono text-xs tracking-wide text-accent uppercase">{archetype}</div>
        <div
          className={clsx(
            'tracking-wid font-serif text-3xl font-semibold',
            stateType === 'terminal' && 'text-slate-500',
          )}
        >
          {name}
        </div>
        <div
          className={clsx(
            'inline-block rounded-full font-mono text-sm',
            !stateType && 'text-white',
            stateType === 'spooky' && 'text-cyan-400',
            stateType === 'active' && 'text-amber-400',
            stateType === 'passive' && 'text-slate-400',
            stateType === 'danger' && 'text-red-400',
            stateType === 'terminal' && 'text-slate-500',
          )}
        >
          {camelCaseToWords(String(state))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">{children}</div>
    </div>
  );
}

function camelCaseToWords(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
