import { createFileRoute } from '@tanstack/react-router';
import { useActorRef, useSelector } from '@xstate/react';
import { silentNight } from '@/chapters/silent-night';
import { Tab, TabList, TabPanel, Tabs } from '@/ui/tabs';
import { BackButton } from '@/ui/back-button';

export const Route = createFileRoute('/chapters/silent-night')({ component: RouteComponent });

function RouteComponent() {
  const actorRef = useActorRef(silentNight.machine);
  const state = useSelector(actorRef, (x) => ({
    isDone: x.status === 'done',
    hasWon: x.matches('won'),
    hasLost: x.matches('lost'),
  }));

  return (
    <silentNight.context value={actorRef}>
      <div className="grid h-screen grid-cols-[400px_minmax(0,1fr)] grid-rows-1">
        <Sidepanel />
        <main className="relative grid h-full grid-rows-[minmax(0,4fr)_minmax(0,3fr)] overflow-clip">
          {!!state.hasWon && (
            <div className="p-8">
              <div className="rounded bg-green-950 p-4 font-bold text-green-100">
                Human is dead, you won!
              </div>
            </div>
          )}
          {!!state.hasLost && (
            <div className="p-8">
              <div className="rounded bg-red-950 p-4 font-bold text-red-100">
                The human survived, you lost!
              </div>
            </div>
          )}
          {!state.isDone && (
            <>
              <silentNight.Time />
              <ActorCards />
              <Drawer />
            </>
          )}
        </main>
      </div>
    </silentNight.context>
  );
}

function Sidepanel() {
  return (
    <aside className="overflow-auto p-8">
      <BackButton />
      <h1 className="mt-12">
        <span className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
          {silentNight.chapter}
        </span>
        <span className="block font-spooky text-3xl">{silentNight.title}</span>
      </h1>
      <hr className="my-6 border-slate-800" />
      <div className="font-serif text-lg text-slate-400 italic">{silentNight.intro}</div>
    </aside>
  );
}

function ActorCards() {
  return (
    <div
      className="grid auto-rows-auto grid-cols-[repeat(auto-fit,minmax(250px,1fr))] content-start
        gap-8 overflow-auto px-8 py-20"
    >
      {Object.entries(silentNight.actors).map(([key, Card]) => (
        <Card key={key} />
      ))}
    </div>
  );
}

function Drawer() {
  return (
    <div className="m-8 rounded-xl border border-slate-800/70 bg-slate-800/30 shadow">
      <Tabs defaultValue="logs">
        <TabList>
          <Tab value="logs">Occurrences</Tab>
          <Tab value="code">Code</Tab>
        </TabList>
        <TabPanel value="logs">
          <silentNight.Logs />
        </TabPanel>
        <TabPanel value="code" keepMounted>
          <pre>{silentNight.code}</pre>
        </TabPanel>
      </Tabs>
    </div>
  );
}
