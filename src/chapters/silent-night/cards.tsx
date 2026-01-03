import { useChildSelector } from './selector';
import { ActorCard } from '@/ui/actor-card';
import { ActorActionButton } from '@/ui/actor-action';
import { mergeMeta } from '@/lib/meta';

export function PoltergeistCard() {
  const [state] = useChildSelector('poltergeist', (x) => ({
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

export function HumanCard() {
  const [state] = useChildSelector('human', (x) => ({
    value: typeof x.value === 'string' ? x.value : Object.keys(x.value)[0],
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
  const [state, childRef] = useChildSelector('cat', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  const onNudge = () => childRef.send({ type: 'nudge' });

  return (
    <ActorCard
      archetype="Cat"
      emoji="🐈‍⬛"
      name="Snowball"
      state={state.value}
      stateType={state.stateType}
    >
      {state.stateType !== 'terminal' && (
        <ActorActionButton onClick={onNudge}>Nudge</ActorActionButton>
      )}
    </ActorCard>
  );
}

export function ChristmasTreeCard() {
  const [state, actorRef] = useChildSelector('christmasTree', (x) => ({
    value: x.value.structure,
    isLit: x.value.candles === 'lit',
    stateType: mergeMeta(x.getMeta()).stateType,
    canNudge: x.can({ type: 'nudge' }),
    canIgnite: x.can({ type: 'candles.ignite' }),
    canExtinguish: x.can({ type: 'candles.extinguish' }),
  }));

  return (
    <ActorCard
      archetype="Christmas Tree"
      emoji="🎄"
      name="Douglas"
      state={state.value + (state.isLit ? ' 🕯️' : '')}
      stateType={state.stateType}
    >
      {state.canNudge && (
        <ActorActionButton onClick={() => state.canNudge && actorRef.send({ type: 'nudge' })}>
          Shake
        </ActorActionButton>
      )}
      {state.canIgnite && (
        <ActorActionButton
          onClick={() => state.canIgnite && actorRef.send({ type: 'candles.ignite' })}
        >
          Ignite
        </ActorActionButton>
      )}
      {state.canExtinguish && (
        <ActorActionButton
          onClick={() => state.canExtinguish && actorRef.send({ type: 'candles.extinguish' })}
        >
          Snuff
        </ActorActionButton>
      )}
    </ActorCard>
  );
}

export function WindowCard() {
  const [state, actorRef] = useChildSelector('window', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
    canOpen: x.can({ type: 'open' }),
    canClose: x.can({ type: 'close' }),
  }));

  return (
    <ActorCard
      archetype="Window"
      emoji="🪟"
      name="Window"
      state={state.value}
      stateType={state.stateType}
    >
      {state.canOpen && (
        <ActorActionButton onClick={() => state.canOpen && actorRef.send({ type: 'open' })}>
          Open
        </ActorActionButton>
      )}
      {state.canClose && (
        <ActorActionButton onClick={() => state.canClose && actorRef.send({ type: 'close' })}>
          Close
        </ActorActionButton>
      )}
    </ActorCard>
  );
}

export function PlantCard() {
  const [state, actorRef] = useChildSelector('plant', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
    canPush: x.can({ type: 'push' }),
  }));

  const onPush = () => actorRef.send({ type: 'push' });

  return (
    <ActorCard
      archetype="Plant"
      emoji="🪴"
      name="Mr. Leafy III"
      state={state.value}
      stateType={state.stateType}
    >
      {!!state.canPush && <ActorActionButton onClick={onPush}>Topple</ActorActionButton>}
    </ActorCard>
  );
}

export function TelevisionCard() {
  const [state, stateRef] = useChildSelector('television', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
    canTurnOn: x.can({ type: 'turnOn' }),
    canTurnOff: x.can({ type: 'turnOff' }),
  }));

  return (
    <ActorCard
      archetype="Television"
      emoji="📺"
      name="TV"
      state={state.value}
      stateType={state.stateType}
    >
      {state.canTurnOn && (
        <ActorActionButton onClick={() => state.canTurnOn && stateRef.send({ type: 'turnOn' })}>
          Turn On
        </ActorActionButton>
      )}
      {state.canTurnOff && (
        <ActorActionButton onClick={() => state.canTurnOff && stateRef.send({ type: 'turnOff' })}>
          Turn Off
        </ActorActionButton>
      )}
    </ActorCard>
  );
}

export function RobotMopCard() {
  const [state] = useChildSelector('robotMop', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  return (
    <ActorCard
      archetype="Robot Mop"
      emoji="🤖"
      name="Sisyphus"
      state={state.value}
      stateType={state.stateType}
    />
  );
}

export function FoodDeliveryServiceCard() {
  const [state] = useChildSelector('foodDeliveryService', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  return (
    <ActorCard
      archetype="Food Delivery Service"
      emoji="🍔"
      name="Mr. Yummy Tummy"
      state={state.value}
      stateType={state.stateType}
    />
  );
}

export function NeighborCard() {
  const [state] = useChildSelector('neighbor', (x) => ({
    value: x.value,
    stateType: mergeMeta(x.getMeta()).stateType,
  }));

  return (
    <ActorCard
      archetype="Neighbor"
      emoji="🙎‍♂️"
      name="Gary"
      state={state.value}
      stateType={state.stateType}
    />
  );
}
