import { createFileRoute } from '@tanstack/react-router';
import { useActorRef, useSelector } from '@xstate/react';
import { silentNight } from '@/chapters/silent-night';

export const Route = createFileRoute('/chapters/silent-night')({ component: RouteComponent });

function RouteComponent() {
  const actorRef = useActorRef(silentNight.machine);
  const state = useSelector(actorRef, (x) => ({
    isDone: x.status === 'done',
    hasWon: x.matches('won'),
    hasLost: x.matches('lost'),
  }));

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Unfortunate Transitions</h1>
      {!!state.hasWon && (
        <div className="rounded bg-green-100 p-4 font-bold text-green-800">
          Human is dead, you won!
        </div>
      )}
      {!!state.hasLost && (
        <div className="rounded bg-red-100 p-4 font-bold text-red-800">
          The human survived, you lost!
        </div>
      )}
      {!state.isDone && (
        <silentNight.context value={actorRef}>
          <silentNight.details />
          <div className="flex gap-6">
            {Object.entries(silentNight.cards).map(([key, Card]) => (
              <Card key={key} />
            ))}
          </div>
        </silentNight.context>
      )}
      <pre className="h-72 overflow-auto border">{silentNight.code}</pre>
    </main>
  );
}
