import { useSelector } from '@xstate/react';
import { Moon, Sun } from 'lucide-react';
import { useRootActor } from './context';
import { formatTime } from '@/lib/time';

export function Time() {
  const actorRef = useRootActor();
  const timeActor = useSelector(actorRef, (x) => x.children.time!);
  const virtualTime = useSelector(timeActor, (x) => x.context.virtualTime);

  const isNight = virtualTime >= 19 * 60 || virtualTime < 6 * 60;
  const Icon = isNight ? Moon : Sun;

  return (
    <div
      className="fixed top-4 right-8 inline-flex items-center gap-2 rounded bg-slate-800 px-3 py-2
        font-mono"
    >
      <Icon size={16} /> {formatTime(virtualTime)}
    </div>
  );
}

export function Logs() {
  const actorRef = useRootActor();
  const loggerActor = useSelector(actorRef, (x) => x.children.logger!);
  const logs = useSelector(loggerActor, (x) => x.context.logs);

  return (
    <div className="font-mono">
      {logs.length === 0 && <div className="text-slate-500">No logs yet</div>}
      {logs.map((log, index) => (
        <div key={index} className="flex items-center gap-4 rounded px-3 py-2 odd:bg-slate-900">
          <div className="text-sm text-slate-500">{formatTime(log.timestamp)}</div>
          <div>{log.emoji}</div>
          <div>{log.text}</div>
        </div>
      ))}
    </div>
  );
}
