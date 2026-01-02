import clsx from 'clsx';
import type { ComponentProps } from 'react';

export function ActorActionButton(props: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        `relative cursor-pointer rounded border-slate-700 bg-accent/10 px-2 py-0.5 font-mono text-sm
        text-accent transition-all active:scale-[.97] disabled:cursor-not-allowed
        disabled:opacity-50`,
        props.className,
      )}
    />
  );
}
