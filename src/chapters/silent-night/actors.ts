import {
  assign,
  enqueueActions,
  forwardTo,
  fromPromise,
  not,
  or,
  raise,
  sendParent,
  sendTo,
  setup,
  stateIn,
  waitFor,
} from 'xstate';
import { logger } from './logger';
import { time, timeListener } from './time';
import { msPerVirtualMin } from './config';
import type { ActorRefFrom, ActorRefFromLogic } from 'xstate';
import type { Meta } from '@/lib/meta';
import { mergeMeta } from '@/lib/meta';
import { isTime } from '@/lib/time';

const poltergeist = setup({
  types: { meta: {} as Meta },
}).createMachine({
  id: 'poltergeist',
  initial: 'mischievous',
  states: {
    mischievous: {
      meta: { stateType: 'spooky' },
      on: { homeless: 'homeless' },
    },
    homeless: {
      meta: { stateType: 'terminal' },
    },
  },
});

const human = setup({
  types: {
    meta: {} as Meta,
    context: {} as { hungerLevel: number },
    output: {} as { deceased: boolean },
  },
}).createMachine({
  id: 'human',
  context: { hungerLevel: 0 },
  initial: 'awake',
  states: {
    awake: {
      meta: { stateType: 'active' },
      after: {
        [msPerVirtualMin]: {
          target: '.',
          reenter: true,
          actions: assign({ hungerLevel: ({ context }) => context.hungerLevel + 1 }),
        },
      },
      always: {
        guard: ({ context }) => context.hungerLevel >= 100,
        target: 'preparingMeal',
      },
      on: {
        'food.delivered': 'eating',
        'cat.inDanger': 'rushing',
        'house.onFire': 'rushing',
      },
    },
    eating: {
      meta: { stateType: 'active' },
      initial: 'seasoning',
      states: {
        seasoning: {
          always: [
            {
              guard: ({ context }) => context.hungerLevel >= 100,
              target: 'devouring',
            },
            { target: 'normal' },
          ],
        },
        normal: {
          after: {
            [msPerVirtualMin * 5]: {
              target: '.',
              reenter: true,
              actions: assign({
                hungerLevel: ({ context }) =>
                  Math.max(0, context.hungerLevel - Math.ceil(context.hungerLevel * 0.15)),
              }),
            },
          },
        },
        devouring: {
          after: {
            [msPerVirtualMin * 10]: {
              actions: assign({ hungerLevel: -500 }),
              target: '#human.choking',
            },
          },
        },
      },
      on: { 'house.onFire': 'rushing' },
      always: {
        guard: ({ context }) => context.hungerLevel <= 0,
        actions: assign({ hungerLevel: -200 }),
        target: 'sleeping',
      },
    },
    preparingMeal: {
      meta: { stateType: 'active' },
      on: { 'house.onFire': 'rushing' },
      after: {
        [msPerVirtualMin * 15]: 'eating',
      },
    },
    choking: {
      meta: { stateType: 'danger' },
      entry: sendParent({ type: 'sos' }, { delay: msPerVirtualMin * 1 }),
      after: { [msPerVirtualMin * 5]: 'dead' },
      on: { rescued: '#human.awake', 'house.onFire': 'dead' },
    },
    rushing: {
      meta: { stateType: 'active' },
      after: {
        [msPerVirtualMin]: {
          actions: sendTo(
            ({ system }) => system.get('floor'),
            ({ self }) => ({ type: 'running', from: self }),
          ),
        },
        [msPerVirtualMin * 3]: 'leftHouse',
      },
      on: { slip: 'slipping' },
    },
    sleeping: {
      meta: { stateType: 'passive' },
      on: { 'house.onFire': 'dead' },
    },
    slipping: {
      meta: { stateType: 'danger' },
      after: {
        [msPerVirtualMin * 1]: 'dead',
      },
    },
    leftHouse: {
      type: 'final',
      meta: { stateType: 'terminal' },
      output: { deceased: false },
    },
    dead: {
      type: 'final',
      meta: { stateType: 'terminal' },
      output: { deceased: true },
    },
  },
  output: ({ event }) => event.output as { deceased: boolean },
});

const cat = setup({
  types: { meta: {} as Meta },
}).createMachine({
  id: 'cat',
  initial: 'sleeping',
  states: {
    sleeping: {
      meta: { stateType: 'passive' },
      on: { nudge: 'awake', danger: 'dead' },
    },
    awake: {
      meta: { stateType: 'active' },
      on: { rideAvailable: 'riding', scare: 'panicking', danger: 'panicking' },
    },
    riding: {
      meta: { stateType: 'active' },
      on: { scare: 'panicking', danger: 'panicking', rideStopped: 'awake' },
    },
    panicking: {
      meta: { stateType: 'danger' },
      on: { escape: 'escaped', hide: 'hidden', die: 'dead' },
      after: {
        [msPerVirtualMin * 1]: {
          actions: enqueueActions(({ system, enqueue, event }) => {
            const windowRef: ActorRefFrom<typeof window> = system.get('window');
            const isWindowOpen = windowRef.getSnapshot().value === 'open';
            const isDanger = event.type === 'danger';

            enqueue.raise({ type: isWindowOpen ? 'escape' : isDanger ? 'die' : 'hide' });
          }),
        },
      },
    },
    escaped: {
      type: 'final',
      entry: sendParent({ type: 'cat.escaped' }),
      meta: { stateType: 'terminal' },
    },
    hidden: {
      meta: { stateType: 'passive' },
      on: { danger: 'dead' },
    },
    dead: {
      type: 'final',
      meta: { stateType: 'terminal' },
    },
  },
});

const christmasTree = setup({
  types: {
    meta: {} as Meta,
    context: {} as { wobbleIntensity: number },
  },
  guards: {
    locked: or([stateIn({ structure: 'fallen' }), stateIn({ structure: 'burning' })]),
  },
}).createMachine({
  type: 'parallel',
  context: { wobbleIntensity: 0 },
  states: {
    candles: {
      initial: 'extinguished',
      states: {
        lit: {
          meta: { stateType: 'active' },
          on: {
            extinguish: {
              guard: not('locked'),
              target: 'extinguished',
            },
          },
        },
        extinguished: {
          on: {
            ignite: {
              guard: not('locked'),
              target: 'lit',
            },
          },
        },
      },
    },
    structure: {
      initial: 'standing',
      states: {
        standing: {
          entry: assign({ wobbleIntensity: 0 }),
          on: {
            nudge: {
              target: 'wobbling',
              actions: assign({ wobbleIntensity: 1 }),
            },
          },
        },
        wobbling: {
          meta: { stateType: 'danger' },
          on: {
            nudge: {
              actions: assign({ wobbleIntensity: ({ context }) => context.wobbleIntensity + 1 }),
              reenter: true,
            },
          },
          always: [
            {
              guard: ({ context }) => context.wobbleIntensity >= 6,
              target: 'fallen',
            },
            {
              guard: ({ context }) => context.wobbleIntensity <= 0,
              target: 'standing',
            },
          ],
          after: {
            [msPerVirtualMin * 3]: {
              target: '.',
              reenter: true,
              actions: assign({ wobbleIntensity: ({ context }) => context.wobbleIntensity - 1 }),
            },
          },
        },
        fallen: {
          meta: { stateType: 'passive' },
          entry: sendParent({ type: 'christmasTree.fallen' }),
          after: {
            [msPerVirtualMin * 5]: {
              guard: stateIn('candles.lit'),
              target: 'burning',
            },
          },
        },
        burning: {
          meta: { stateType: 'danger' },
          after: {
            [msPerVirtualMin * 5]: {
              actions: sendParent({ type: 'christmasTree.burning' }),
            },
          },
        },
      },
    },
  },
});

const window = setup({
  types: { meta: {} as Meta },
}).createMachine({
  initial: 'closed',
  states: {
    closed: {
      meta: { stateType: 'passive' },
      on: { open: 'open' },
    },
    open: {
      meta: { stateType: 'active' },
      on: { close: 'closed' },
    },
  },
});

const plant = setup({
  types: { meta: {} as Meta },
}).createMachine({
  initial: 'standing',
  states: {
    standing: {
      meta: { stateType: 'passive' },
      on: {
        push: {
          target: 'fallen',
          actions: sendParent({ type: 'plant.falling' }),
        },
      },
    },
    fallen: {
      meta: { stateType: 'terminal' },
    },
  },
});

const television = setup({
  types: { meta: {} as Meta },
}).createMachine({
  initial: 'on',
  states: {
    off: {
      meta: { stateType: 'passive' },
      on: { turnOn: 'on' },
    },
    on: {
      meta: { stateType: 'active' },
      on: { turnOff: 'off' },
    },
  },
});

const robotMop = setup({
  types: {
    meta: {} as Meta,
    input: {} as { floor: ActorRefFromLogic<typeof floor> },
    context: {} as { floor: ActorRefFromLogic<typeof floor> },
  },
  actors: {
    dirtDetector: fromPromise<unknown, { floor: ActorRefFromLogic<typeof floor> }>(({ input }) => {
      return waitFor(input.floor, (x) => x.matches('dirty'));
    }),
  },
}).createMachine({
  initial: 'docked',
  context: ({ input }) => ({ floor: input.floor }),
  states: {
    docked: {
      meta: { stateType: 'passive' },
      invoke: {
        src: 'dirtDetector',
        input: ({ context }) => ({ floor: context.floor }),
        onDone: 'cleaning',
      },
    },
    cleaning: {
      meta: { stateType: 'active' },
      entry: [
        sendParent({ type: 'robotMop.cleaning' }),
        sendTo(({ context }) => context.floor, { type: 'wet' }),
      ],
      after: {
        [msPerVirtualMin * 30]: {
          actions: [
            sendParent({ type: 'robotMop.done' }),
            sendTo(({ context }) => context.floor, { type: 'dry' }),
          ],
          target: 'docked',
        },
      },
    },
  },
});

const floor = setup({}).createMachine({
  initial: 'dry',
  states: {
    dry: { on: { dirty: 'dirty' } },
    dirty: { on: { wet: 'wet' } },
    wet: {
      on: {
        dry: 'dry',
        running: {
          actions: sendTo(({ event }) => event.from, { type: 'slip' }),
        },
      },
    },
  },
});

const foodDeliveryService = setup({
  types: {
    context: {} as { time: number },
    meta: {} as Meta,
  },
  actors: { timeListener },
}).createMachine({
  initial: 'cooking',
  context: { time: -1 },
  invoke: { src: 'timeListener' },
  on: {
    'time.update': {
      actions: assign(({ event }) => ({ time: event.virtualTime })),
    },
  },
  states: {
    cooking: {
      meta: { stateType: 'passive' },
      always: {
        guard: ({ context }) => isTime(context.time, '18:00'),
        target: 'delivering',
      },
    },
    delivering: {
      meta: { stateType: 'active' },
      on: { bonked: 'stargazing' },
      always: {
        guard: ({ context }) => isTime(context.time, '18:15'),
        actions: sendParent({ type: 'food.delivered' }),
        target: 'offDuty',
      },
    },
    offDuty: {
      meta: { stateType: 'passive' },
    },
    stargazing: {
      type: 'final',
      meta: { stateType: 'terminal' },
    },
  },
});

const neighbor = setup({
  types: { meta: {} as Meta },
}).createMachine({
  initial: 'untanglingChristmasLights',
  states: {
    untanglingChristmasLights: {
      meta: { stateType: 'passive' },
      after: { [msPerVirtualMin * 120]: 'smokingOnBalcony' },
    },
    smokingOnBalcony: {
      tags: ['withinEarshot'],
      meta: { stateType: 'active' },
      after: { [msPerVirtualMin * 30]: 'untanglingChristmasLights' },
    },
    helping: {
      meta: { stateType: 'active' },
      entry: sendTo(({ event }) => event.from, { type: 'rescued' }),
      after: { [msPerVirtualMin * 10]: 'untanglingChristmasLights' },
    },
  },
  on: { sos: '.helping' },
});

export const scene = setup({
  types: {
    children: {} as {
      time: 'time';
      logger: 'logger';
      poltergeist: 'poltergeist';
      human: 'human';
      cat: 'cat';
      christmasTree: 'christmasTree';
      window: 'window';
      plant: 'plant';
      television: 'television';
      robotMop: 'robotMop';
      floor: 'floor';
      foodDeliveryService: 'foodDeliveryService';
      neighbor: 'neighbor';
    },
  },
  actors: {
    logger,
    time,
    poltergeist,
    human,
    cat,
    christmasTree,
    window,
    plant,
    television,
    robotMop,
    floor,
    foodDeliveryService,
    neighbor,
  },
}).createMachine({
  id: 'silentNight',
  initial: 'playing',
  invoke: [
    {
      id: 'logger',
      systemId: 'logger',
      src: 'logger',
    },
    {
      id: 'time',
      systemId: 'time',
      src: 'time',
      onSnapshot: [
        {
          guard: ({ event }) => isTime(event.snapshot.context.virtualTime, '24:00'),
          target: '.lost',
        },
      ],
    },
    {
      id: 'poltergeist',
      systemId: 'poltergeist',
      src: 'poltergeist',
    },
    {
      id: 'human',
      systemId: 'human',
      src: 'human',
      onDone: [
        {
          guard: ({ event }) => event.output.deceased === true,
          actions: raise(({ self }) => {
            const poltergeistRef: ActorRefFrom<typeof poltergeist> = self.system.get('poltergeist');
            const poltergeistMeta = mergeMeta(poltergeistRef.getSnapshot().getMeta());
            const isSpooky = poltergeistMeta.stateType === 'spooky';

            return { type: isSpooky ? 'won' : 'lost' };
          }),
        },
        { target: '.lost' },
      ],
    },
    {
      id: 'cat',
      systemId: 'cat',
      src: 'cat',
    },
    {
      id: 'christmasTree',
      systemId: 'christmasTree',
      src: 'christmasTree',
    },
    {
      id: 'window',
      systemId: 'window',
      src: 'window',
    },
    {
      id: 'plant',
      systemId: 'plant',
      src: 'plant',
    },
    {
      id: 'television',
      systemId: 'television',
      src: 'television',
    },
    {
      id: 'floor',
      systemId: 'floor',
      src: 'floor',
    },
    {
      id: 'robotMop',
      systemId: 'robotMop',
      src: 'robotMop',
      input: ({ self }) => ({ floor: self.system.get('floor') }),
    },
    {
      id: 'foodDeliveryService',
      systemId: 'foodDeliveryService',
      src: 'foodDeliveryService',
    },
    {
      id: 'neighbor',
      systemId: 'neighbor',
      src: 'neighbor',
    },
  ],
  states: {
    playing: {
      on: {
        won: 'won',
        lost: 'lost',
        'plant.falling': {
          actions: enqueueActions(({ system, enqueue }) => {
            const windowRef: ActorRefFrom<typeof window> = system.get('window');
            const isWindowOpen = windowRef.getSnapshot().value === 'open';

            isWindowOpen
              ? enqueue.sendTo('foodDeliveryService', { type: 'bonked' })
              : enqueue.sendTo('floor', { type: 'dirty' });
          }),
        },
        'christmasTree.fallen': {
          actions: sendTo('cat', { type: 'scare' }),
        },
        'christmasTree.burning': {
          actions: [
            sendTo('cat', { type: 'danger' }),
            sendTo('human', { type: 'house.onFire' }),
            sendTo('poltergeist', { type: 'homeless' }),
          ],
        },
        'food.delivered': { actions: forwardTo('human') },
        sos: {
          actions: enqueueActions(({ system, enqueue }) => {
            const windowRef: ActorRefFrom<typeof window> = system.get('window');
            const neighboarRef: ActorRefFrom<typeof neighbor> = system.get('neighbor');
            const isWindowOpen = windowRef.getSnapshot().value === 'open';
            const isNeighborAvailable = neighboarRef.getSnapshot().hasTag('withinEarshot');
            const humanRef: ActorRefFrom<typeof human> = system.get('human');

            if (isWindowOpen && isNeighborAvailable) {
              enqueue.sendTo('neighbor', { type: 'sos', from: humanRef });
            }
          }),
        },
        'robotMop.cleaning': {
          actions: sendTo('cat', { type: 'rideAvailable' }, { delay: msPerVirtualMin * 5 }),
        },
        'robotMop.done': {
          actions: sendTo('cat', { type: 'rideStopped' }),
        },
        'cat.escaped': {
          actions: sendTo('human', { type: 'cat.inDanger' }),
        },
      },
    },
    won: { type: 'final' },
    lost: { type: 'final' },
  },
});
