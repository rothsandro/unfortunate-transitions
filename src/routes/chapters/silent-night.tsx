import { Link, createFileRoute } from '@tanstack/react-router';
import { useActorRef, useSelector } from '@xstate/react';
import { RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { silentNight } from '@/chapters/silent-night';
import { Tab, TabList, TabPanel, Tabs } from '@/ui/tabs';
import { BackButton } from '@/ui/back-button';
import { useSafeContext } from '@/lib/context';
import { applySyntaxHighlighting } from '@/lib/syntax-highlighting';

export const Route = createFileRoute('/chapters/silent-night')({
  component: RouteComponent,
  loader: async () => ({ code: await applySyntaxHighlighting(silentNight.code) }),
});

function RouteComponent() {
  const actorRef = useActorRef(silentNight.machine);

  return (
    <silentNight.context value={actorRef}>
      <div className="grid h-screen grid-cols-[340px_minmax(0,1fr)] grid-rows-1">
        <Sidepanel />
        <main
          className="relative grid h-full grid-rows-[minmax(0,4fr)_minmax(0,3fr)] gap-4
            overflow-clip"
        >
          <ActorCards />
          <Drawer />
        </main>
      </div>
    </silentNight.context>
  );
}

function Sidepanel() {
  const actorRef = useSafeContext(silentNight.context);
  const state = useSelector(actorRef, (x) => ({
    isDone: x.status === 'done',
    hasWon: x.matches('won'),
    hasLost: x.matches('lost'),
  }));

  return (
    <aside
      className={clsx(
        'relative flex min-h-full flex-col overflow-auto p-8',
        !!state.hasWon && 'border-r border-emerald-950 bg-emerald-950/40',
        !!state.hasLost && 'border-r border-red-950 bg-red-950/30',
      )}
    >
      <BackButton />

      {!!state.hasWon && <ChapterCompleteMessage />}
      {!!state.hasLost && <ChapterFailedMessage />}
      {!state.isDone && (
        <>
          <h1 className="mt-12">
            <span className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
              {silentNight.chapter}
            </span>
            <span className="block font-spooky text-3xl">{silentNight.title}</span>
          </h1>
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
  );
}

function ChapterCompleteMessage() {
  return (
    <div className="mt-12 grow">
      <div className="text-7xl">💀</div>
      <h1 className="mt-6 font-spooky text-4xl font-semibold text-emerald-500">Chapter Complete</h1>
      <p className="mt-4 font-serif text-2xl">
        Everything went according to plan. Well, your plan.
      </p>
      <Link
        to="."
        className="mt-6 flex items-center justify-center gap-2 rounded bg-slate-800 p-3 text-white"
        reloadDocument
      >
        <RefreshCcw size={20} /> Restart Chapter
      </Link>
    </div>
  );
}

function ChapterFailedMessage() {
  return (
    <div className="mt-12 grow">
      <div className="text-7xl">🤦</div>
      <h1 className="mt-6 font-spooky text-4xl font-semibold text-red-500">Mission Failed</h1>
      <p className="mt-4 font-serif text-2xl">Centuries of haunting experience, wasted.</p>
      <Link
        to="."
        className="mt-6 flex items-center justify-center gap-2 rounded bg-red-600 p-3 text-white"
        reloadDocument
      >
        <RefreshCcw size={20} /> Try Again
      </Link>
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
  const { code } = Route.useLoaderData();

  return (
    <div className="mx-6 rounded-t-xl border border-slate-800/70 bg-slate-800/30 shadow">
      <Tabs defaultValue="logs">
        <TabList>
          <Tab value="logs">Occurrences</Tab>
          <Tab value="code">Code</Tab>
        </TabList>
        <TabPanel value="logs">
          <silentNight.Logs />
        </TabPanel>
        <TabPanel value="code" keepMounted>
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
