import { createFileRoute } from '@tanstack/react-router';
import { useActorRef, useSelector } from '@xstate/react';
import { RefreshCcw, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { Pane, SplitPane } from 'react-split-pane';
import { silentNight } from '@/chapters/silent-night';
import { Tab, TabList, TabPanel, Tabs } from '@/ui/tabs';
import { BackButton } from '@/ui/back-button';
import { useSafeContext } from '@/lib/context';
import { game } from '@/model/game-actor';
import { Spinner } from '@/ui/spinner';
import { SocialLinks } from '@/ui/social-links';
import { CodeViewer } from '@/ui/code-viewer';

export const Route = createFileRoute('/chapters/silent-night')({
  component: RouteComponent,
});

function RouteComponent() {
  const gameActorRef = useActorRef(game.provide({ actors: { chapter: silentNight.machine } }));
  const actorRef = useSelector(gameActorRef, (x) => x.children.chapter);

  const restart = () => gameActorRef.send({ type: 'reset' });

  if (!actorRef) return <Spinner label="Spawning new chaos..." />;

  return (
    <silentNight.context value={actorRef}>
      <div className="grid h-screen grid-cols-[340px_minmax(0,1fr)] grid-rows-1">
        <Sidepanel onRestart={restart} />
        <main>
          <SplitPane
            direction="vertical"
            dividerStyle={{ height: 4 }}
            dividerClassName="mx-6 outline-none focus-visible:bg-accent"
          >
            <Pane minSize={200} defaultSize="60%">
              <ActorCards />
            </Pane>
            <Pane minSize={200}>
              <Drawer />
            </Pane>
          </SplitPane>
        </main>
      </div>
    </silentNight.context>
  );
}

function Sidepanel(props: { onRestart: VoidFunction }) {
  const { onRestart } = props;

  const actorRef = useSafeContext(silentNight.context);
  const state = useSelector(actorRef, (x) => ({
    isDone: x.status === 'done',
    hasWon: x.matches('won'),
    hasLost: x.matches('lost'),
  }));

  return (
    <div
      className={clsx(
        'flex flex-col',
        !!state.hasWon && 'border-r border-emerald-950 bg-emerald-950/40',
        !!state.hasLost && 'border-r border-red-950 bg-red-950/30',
      )}
    >
      <aside className="relative flex grow flex-col overflow-auto p-8">
        <BackButton />

        {!!state.hasWon && <ChapterCompleteMessage onRestart={onRestart} />}
        {!!state.hasLost && <ChapterFailedMessage onRestart={onRestart} />}
        {!state.isDone && (
          <>
            <div className="mt-12 flex items-end justify-between">
              <h1>
                <span className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
                  {silentNight.chapter}
                </span>
                <span className="block font-spooky text-3xl">{silentNight.title}</span>
              </h1>
              <button
                type="button"
                className="mb-1 cursor-pointer rounded text-slate-300 outline-offset-4
                  transition-colors hover:text-slate-100"
                onClick={onRestart}
              >
                <RotateCcw />
                <span className="sr-only">Restart Chapter</span>
              </button>
            </div>
            <hr className="my-6 border-slate-800" />
            <div className="grow space-y-4 font-serif text-lg text-slate-400">
              {silentNight.intro}
            </div>
          </>
        )}
        <div className="sticky bottom-0 mt-8">
          <silentNight.Time />
        </div>
      </aside>
      <footer className="ms-8 border-t border-slate-800 py-4">
        <SocialLinks />
      </footer>
    </div>
  );
}

function ChapterCompleteMessage(props: { onRestart: VoidFunction }) {
  const { onRestart } = props;

  return (
    <div className="mt-12 grow">
      <div className="text-7xl">💀</div>
      <h1 className="mt-6 font-spooky text-4xl font-semibold text-emerald-500">Chapter Complete</h1>
      <p className="mt-4 font-serif text-2xl">
        Everything went according to plan. Well, your plan.
      </p>
      <button
        type="button"
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded
          bg-slate-800 p-3 text-white"
        onClick={onRestart}
      >
        <RefreshCcw size={20} /> Restart Chapter
      </button>
    </div>
  );
}

function ChapterFailedMessage(props: { onRestart: VoidFunction }) {
  const { onRestart } = props;

  return (
    <div className="mt-12 grow">
      <div className="text-7xl">🤦</div>
      <h1 className="mt-6 font-spooky text-4xl font-semibold text-red-500">Mission Failed</h1>
      <p className="mt-4 font-serif text-2xl">Centuries of haunting experience, wasted.</p>
      <button
        type="button"
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded
          bg-red-600 p-3 text-white"
        onClick={onRestart}
      >
        <RefreshCcw size={20} /> Try Again
      </button>
    </div>
  );
}

function ActorCards() {
  return (
    <div
      className="grid auto-rows-auto grid-cols-[repeat(auto-fit,minmax(400px,1fr))] content-start
        gap-6 overflow-auto p-6 pt-8"
    >
      {Object.entries(silentNight.actors).map(([key, Card]) => (
        <Card key={key} />
      ))}
    </div>
  );
}

function Drawer() {
  return (
    <div className="mx-6 h-full rounded-t-xl border border-slate-800/70 bg-slate-800/30 shadow">
      <Tabs defaultValue="logs">
        <TabList>
          <Tab value="logs">Occurrences</Tab>
          <Tab value="code">Code</Tab>
        </TabList>
        <TabPanel value="logs">
          <silentNight.Logs />
        </TabPanel>
        <TabPanel value="code" keepMounted>
          <CodeViewer code={silentNight.code} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
