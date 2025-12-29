import { createFileRoute } from '@tanstack/react-router';
import { useActorRef } from '@xstate/react';
import { useState } from 'react';
import { silentNight } from '@/chapters/silent-night';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [logs, setLogs] = useState<Array<string>>([]);
  const actorRef = useActorRef(silentNight.machine, {
    logger: (message: string) => {
      setLogs((prev) => [message, ...prev]);
    },
  });

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Unfortunate Transitions</h1>
      <div className="flex gap-6">
        <silentNight.context value={actorRef}>
          {Object.entries(silentNight.cards).map(([key, Card]) => (
            <Card key={key} />
          ))}
        </silentNight.context>
      </div>
      <div className="space-y-2 border p-2 font-mono">
        {logs.length === 0 && <div className="text-slate-500">No logs yet</div>}
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      <pre className="h-72 overflow-auto border">{silentNight.code}</pre>
    </main>
  );
}
