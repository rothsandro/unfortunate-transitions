import { useSelector } from '@xstate/react';
import { useRootActor } from './context';
import { ActorCard } from '@/ui/actor-card';
import { ActorActionButton } from '@/ui/actor-action';
import { mergeMeta } from '@/lib/meta';

export function AlarmClockCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.alarmClock!);
  const state = useSelector(childRef, (x) => ({
    value: x.value,
    triggerEnabled: x.can({ type: 'trigger' }),
  }));
  const onTrigger = () => childRef.send({ type: 'trigger' });

  return (
    <ActorCard archetype="Alarm Clock" emoji="⏰" name="Doom Bell" state={state.value}>
      {!!state.triggerEnabled && <ActorActionButton onClick={onTrigger}>Trigger</ActorActionButton>}
    </ActorCard>
  );
}

export function HumanCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.human!);
  const state = useSelector(childRef, (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  return (
    <ActorCard
      archetype="Human"
      emoji="🤵‍♂️"
      name="Mallory"
      state={state.value}
      stateType={state.stateType}
    />
  );
}

export function CatCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.cat!);
  const state = useSelector(childRef, (x) => ({
    value: x.value,
    canNudge: x.can({ type: 'nudge' }),
  }));

  const onNudge = () => childRef.send({ type: 'nudge' });

  return (
    <ActorCard archetype="Cat" emoji="😼" name="Luna" state={state.value}>
      {!!state.canNudge && <ActorActionButton onClick={onNudge}>Nudge</ActorActionButton>}
    </ActorCard>
  );
}

export function PoltergeistCard() {
  const rootRef = useRootActor();
  const childRef = useSelector(rootRef, (x) => x.children.poltergeist!);
  const state = useSelector(childRef, (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  return (
    <ActorCard
      archetype="Poltergeist"
      emoji="👻"
      name="You"
      state={state.value}
      stateType={state.stateType}
    />
  );
}
