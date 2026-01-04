import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { clsx } from 'clsx';
import type {
  TabsListProps,
  TabsPanelProps,
  TabsRootProps,
  TabsTabProps,
} from '@base-ui/react/tabs';

export function Tabs(props: TabsRootProps) {
  return (
    <BaseTabs.Root
      {...props}
      className={clsx(props.className, 'grid h-full grid-rows-[auto_minmax(0,1fr)]')}
    />
  );
}

export function TabList(props: TabsListProps) {
  return (
    <div className="p-3">
      <BaseTabs.List {...props} className={clsx(props.className, 'relative z-0 flex gap-1')}>
        {props.children}
        <BaseTabs.Indicator
          className="absolute inset-y-0 z-[-1] w-(--active-tab-width)
            translate-x-(--active-tab-left) rounded-full bg-accent/20 transition-all duration-200
            ease-in-out"
        />
      </BaseTabs.List>
    </div>
  );
}

export function Tab(props: TabsTabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      className={clsx(
        `flex items-center justify-center border-0 px-4 py-1.5 text-sm font-semibold break-keep
        whitespace-nowrap text-slate-400 capitalize select-none before:inset-x-0 before:inset-y-1
        hover:text-slate-300 data-active:text-accent`,
        props.className,
      )}
    />
  );
}

export function TabPanel(props: TabsPanelProps) {
  return (
    <BaseTabs.Panel {...props} className={clsx(props.className, 'h-full overflow-auto p-4')} />
  );
}
