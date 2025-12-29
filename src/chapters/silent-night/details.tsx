import { useSelector } from '@xstate/react';
import { useRootActor } from './context';

export const Details = () => {
  const actorRef = useRootActor();
  const isDone = useSelector(actorRef, (x) => x.status === 'done');

  if (isDone) return null;

  return <Time />;
};

const Time = () => {
  const actorRef = useRootActor();
  const timeActor = useSelector(actorRef, (x) => x.children.time!);
  const timeState = useSelector(timeActor, (x) => x.context.virtualTime);
  const hours = String(Math.floor(timeState / 60)).padStart(2, '0');
  const minutes = String(timeState % 60).padStart(2, '0');

  return (
    <div className="border p-4 font-mono text-3xl">
      Time: {hours}:{minutes}
    </div>
  );
};
