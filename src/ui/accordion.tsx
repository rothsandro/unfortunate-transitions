import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AccordionProps {
  items: Array<{
    key: string;
    title: string;
    content: ReactNode;
  }>;
}

export function Accordion(props: AccordionProps) {
  const { items } = props;

  return (
    <BaseAccordion.Root hiddenUntilFound multiple className="space-y-2">
      {items.map((item) => (
        <BaseAccordion.Item
          key={item.key}
          value={item.key}
          className="rounded-lg border border-slate-800/70 bg-slate-800/20 transition-colors
            hover:border-slate-700"
        >
          <BaseAccordion.Header>
            <BaseAccordion.Trigger
              className="group flex w-full items-center justify-between gap-3 rounded-lg p-4
                font-mono text-sm font-medium text-slate-300 outline-offset-2 transition-colors
                hover:text-slate-100"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={20}
                className="shrink-0 text-accent transition-transform duration-200
                  group-data-panel-open:rotate-180"
              />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="overflow-auto">
            <div className="border-t border-slate-800/70 bg-slate-900/30 p-4">{item.content}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
