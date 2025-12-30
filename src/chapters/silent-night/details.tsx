import { useSelector } from '@xstate/react';
import { Moon, Sun } from 'lucide-react';
import { useRootActor } from './context';

export function Time() {
  const actorRef = useRootActor();
  const timeActor = useSelector(actorRef, (x) => x.children.time!);
  const timeState = useSelector(timeActor, (x) => x.context.virtualTime);

  const hours = String(Math.floor(timeState / 60)).padStart(2, '0');
  const minutes = String(timeState % 60).padStart(2, '0');
  const isNight = timeState >= 19 * 60 || timeState < 6 * 60;
  const Icon = isNight ? Moon : Sun;

  return (
    <div
      className="fixed top-4 right-8 inline-flex items-center gap-2 rounded bg-slate-800 px-3 py-2
        font-mono"
    >
      <Icon size={16} /> {hours}:{minutes}
    </div>
  );
}

export function Logs() {
  const actorRef = useRootActor();
  const loggerActor = useSelector(actorRef, (x) => x.children.logger!);
  const logs = useSelector(loggerActor, (x) => x.context.logs);

  return (
    <div className="space-y-2 font-mono">
      {logs.length === 0 && <div className="text-slate-500">No logs yet</div>}
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  );
}
