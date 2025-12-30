import clsx from 'clsx';
import type { ComponentProps } from 'react';

export function ActorActionButton(props: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        `w-full rounded border border-slate-700 px-4 py-2 font-serif transition-all
        hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50`,
        props.className,
      )}
    />
  );
}
