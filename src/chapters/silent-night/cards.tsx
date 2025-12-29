import { useSelector } from '@xstate/react';
import { useRootActor } from './context';

export function AlarmClockCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.alarmClock!);
  const state = useSelector(childRef, (x) => ({
    value: x.value,
    triggerEnabled: x.can({ type: 'trigger' }),
  }));
  const onTrigger = () => childRef.send({ type: 'trigger' });

  return (
    <div className="border">
      <div aria-hidden="true" className="text-7xl">
        ⏰
      </div>
      <h3 className="text-3xl">Alarm Clock</h3>
      <p>{String(state.value).replace(/^./, (char) => char.toUpperCase())}</p>
      {!!state.triggerEnabled && (
        <button type="button" onClick={onTrigger}>
          Trigger
        </button>
      )}
    </div>
  );
}

export function HumanCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.human!);
  const state = useSelector(childRef, (x) => x.value);

  return (
    <div className="border">
      <div aria-hidden="true" className="text-7xl">
        🤵‍♂️
      </div>
      <h3 className="text-3xl">Human</h3>
      <p>{String(state).replace(/^./, (char) => char.toUpperCase())}</p>
    </div>
  );
}

export function CatCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.cat!);
  const state = useSelector(childRef, (x) => x.value);

  return (
    <div className="border">
      <div aria-hidden="true" className="text-7xl">
        😼
      </div>
      <h3 className="text-3xl">Cat</h3>
      <p>{String(state).replace(/^./, (char) => char.toUpperCase())}</p>
    </div>
  );
}
