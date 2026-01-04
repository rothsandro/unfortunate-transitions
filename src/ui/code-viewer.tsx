import { useActor } from '@xstate/react';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from './spinner';
import { Accordion } from './accordion';
import { codeViewer } from '@/model/code-viewer-actor';

export interface CodeViewerProps {
  code: string;
}

export function CodeViewer(props: CodeViewerProps) {
  const { code } = props;
  const [snapshot] = useActor(codeViewer, { input: { code } });

  if (snapshot.matches('loading')) {
    return <Spinner label="Loading..." />;
  }

  if (snapshot.matches('error')) {
    return (
      <div className="flex items-center justify-center p-8">
        <div
          className="flex items-center gap-4 rounded-lg border border-red-900/50 bg-red-950/30 p-6"
        >
          <AlertTriangle className="shrink-0 text-red-500" size={24} />
          <div>
            <h3 className="font-semibold text-red-400">Error Loading Code</h3>
            <p className="mt-1 text-sm text-slate-400">
              An unexpected error occurred while loading the viewer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      items={snapshot.context.blocks.map((block) => ({
        key: block.name,
        title: block.name,
        content: <div className="text-sm" dangerouslySetInnerHTML={{ __html: block.html }} />,
      }))}
    />
  );
}
