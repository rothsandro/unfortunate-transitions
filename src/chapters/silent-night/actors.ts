import {
  assign,
  enqueueActions,
  forwardTo,
  fromCallback,
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
import { log, logger } from './logger';
import { time, timeListener } from './time';
import { msPerVirtualMin } from './config';
import type { ActorRef, ActorRefFrom, EventObject, Snapshot } from 'xstate';
import type { Meta } from '@/lib/meta';
import { mergeMeta } from '@/lib/meta';
import { isTime } from '@/lib/time';

type PoltergiestActorRef = ActorRefFrom<typeof poltergeist>;
const poltergeist = setup({
  types: {
    meta: {} as Meta,
    events: {} as { type: 'home.lost' },
  },
}).createMachine({
  id: 'poltergeist',
  initial: 'mischievous',
  states: {
    mischievous: {
      meta: { stateType: 'spooky' },
      on: {
        'home.lost': {
          target: 'homeless',
        },
      },
    },
    homeless: {
      meta: { stateType: 'terminal' },
      entry: log('👻 NO! My home... burned to ashes!'),
    },
  },
});

type HumanActorRef = ActorRefFrom<typeof human>;
const human = setup({
  types: {
    meta: {} as Meta,
    input: {} as {
      floor: FloorActor;
    },
    context: {} as {
      tv: TelevisionActor | null;
      floor: FloorActor;
      hungerLevel: number;
    },
    events: {} as
      | { type: 'rescue' }
      | { type: 'slip' }
      | { type: 'hunger.increment' }
      | { type: 'food.delivered' }
      | { type: 'cat.inDanger' }
      | { type: 'house.onFire' }
      | { type: 'television.turnedOn'; tv: TelevisionActor }
      | { type: 'television.turnedOff' },
    output: {} as { deceased: boolean },
  },
  actors: {
    hungerTicker: fromCallback(({ sendBack }) => {
      const id = setInterval(() => sendBack({ type: 'hunger.increment' }), msPerVirtualMin);
      return () => clearInterval(id);
    }),
  },
  actions: {
    incrementHunger: assign({
      hungerLevel: ({ context }) => context.hungerLevel + 1,
    }),
    turnTvOff: enqueueActions(({ context, enqueue }) => {
      if (context.tv) {
        enqueue.sendTo(context.tv, { type: 'turnOff' });
      }
    }),
  },
  guards: {
    isVeryHungry: ({ context }) => context.hungerLevel >= 100,
  },
}).createMachine({
  id: 'human',
  context: ({ input }) => ({
    tv: null,
    floor: input.floor,
    hungerLevel: 0,
  }),
  initial: 'awake',
  states: {
    awake: {
      meta: { stateType: 'active' },
      invoke: { src: 'hungerTicker' },
      always: {
        guard: 'isVeryHungry',
        actions: log("🤵‍♂️ I'm getting hungry..."),
        target: 'preparingMeal',
      },
      on: {
        'food.delivered': {
          actions: log('🤵‍♂️ Oh, my food is here!'),
          target: 'eating',
        },
        'cat.inDanger': {
          actions: log('🤵‍♂️ Snowball! Come back!'),
          target: 'rushing',
        },
        'house.onFire': {
          actions: log('🤵‍♂️ FIRE! I need to get out!'),
          target: 'rushing',
        },
        'television.turnedOn': {
          target: 'watchingTelevision',
          actions: [
            log('🤵‍♂️ Ah, time to relax!'),
            assign({
              tv: ({ event }) => event.tv,
            }),
          ],
        },
      },
    },
    watchingTelevision: {
      meta: { stateType: 'active' },
      invoke: { src: 'hungerTicker' },
      after: {
        [msPerVirtualMin * 30]: {
          target: 'awake',
          actions: [
            log('🤵‍♂️ That was a good movie. Time to do something else.'),
            { type: 'turnTvOff' },
          ],
        },
      },
      on: {
        'food.delivered': {
          actions: [log('🤵‍♂️ Oh, my food is here!'), { type: 'turnTvOff' }],
          target: 'eating',
        },
        'house.onFire': {
          actions: log('🤵‍♂️ FIRE! I need to get out!'),
          target: 'rushing',
        },
        'television.turnedOff': {
          actions: log('🤵‍♂️ Huh? The TV turned off?'),
          target: 'awake',
        },
      },
    },
    eating: {
      meta: { stateType: 'active' },
      initial: 'seasoning',
      states: {
        seasoning: {
          always: [
            {
              guard: 'isVeryHungry',
              target: 'devouring',
            },
            {
              target: 'normal',
              actions: log("🤵‍♂️ Mmm, that's good."),
            },
          ],
        },
        normal: {
          after: {
            [msPerVirtualMin * 5]: {
              actions: assign({
                hungerLevel: ({ context }) =>
                  Math.max(0, context.hungerLevel - Math.ceil(context.hungerLevel * 0.15)),
              }),
              target: '.',
              reenter: true,
            },
          },
        },
        devouring: {
          entry: log("🤵‍♂️ I'm starving! Gotta eat faster!"),
          after: {
            [msPerVirtualMin * 10]: {
              actions: assign({ hungerLevel: -400 }),
              target: '#human.choking',
            },
          },
        },
      },
      on: {
        'house.onFire': {
          actions: log('🤵‍♂️ THE HOUSE IS ON FIRE!'),
          target: 'rushing',
        },
      },
      always: {
        guard: ({ context }) => context.hungerLevel <= 0,
        actions: [log('🤵‍♂️ *yawn* Time for a nap...'), assign({ hungerLevel: -200 })],
        target: 'sleeping',
      },
    },
    preparingMeal: {
      meta: { stateType: 'active' },
      entry: log('🤵‍♂️ Gotta prepare something to eat...'),
      on: {
        'house.onFire': {
          actions: log('🤵‍♂️ Are you kidding me?! FIRE!'),
          target: 'rushing',
        },
      },
      after: {
        [msPerVirtualMin * 15]: {
          actions: log('🤵‍♂️ Finally, dinner is ready!'),
          target: 'eating',
        },
      },
    },
    choking: {
      meta: { stateType: 'danger' },
      entry: [
        log("🤵‍♂️ *gasp* I'm choking! Someone help me!"),
        sendParent({ type: 'sos' }, { delay: msPerVirtualMin * 1 }),
      ],
      after: {
        [msPerVirtualMin * 5]: {
          actions: log('🤵‍♂️ *silence*'),
          target: 'dead',
        },
      },
      on: {
        rescue: {
          actions: log('🤵‍♂️ *cough* Thank you, Gary!'),
          target: '#human.awake',
        },
        'house.onFire': {
          actions: log("🤵‍♂️ Can't breathe... fire... *choke*"),
          target: 'dead',
        },
      },
    },
    rushing: {
      meta: { stateType: 'active' },
      entry: log('🤵‍♂️ Running as fast as I can!'),
      after: {
        [msPerVirtualMin]: {
          actions: sendTo(
            ({ context }) => context.floor,
            ({ self }) => ({ type: 'running', from: self }),
          ),
        },
        [msPerVirtualMin * 3]: {
          actions: log('🤵‍♂️ Made it out! ...but at what cost?'),
          target: 'leftHouse',
        },
      },
      on: {
        slip: {
          actions: log('🤵‍♂️ Wha... *SLIP*'),
          target: 'slipping',
        },
      },
    },
    sleeping: {
      meta: { stateType: 'passive' },
      entry: log('🤵‍♂️ Zzz... zzz...'),
      on: {
        'house.onFire': {
          actions: log('🤵‍♂️ Zzz... *cough* ...zzz...'),
          target: 'dead',
        },
      },
    },
    slipping: {
      meta: { stateType: 'danger' },
      entry: log('🤵‍♂️ AAAHHH *CRASH*'),
      after: {
        [msPerVirtualMin]: {
          actions: log('🤵‍♂️ Everything... hurts...'),
          target: 'dead',
        },
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
  on: {
    'hunger.increment': {
      actions: 'incrementHunger',
    },
  },
  output: ({ event }) => event.output as { deceased: boolean },
});

const cat = setup({
  types: {
    meta: {} as Meta,
    events: {} as
      | { type: 'nudge' }
      | { type: 'scare' }
      | { type: 'danger' }
      | { type: 'escape' }
      | { type: 'hide' }
      | { type: 'die' }
      | { type: 'ride.available' }
      | { type: 'ride.stopped' },
  },
}).createMachine({
  id: 'cat',
  initial: 'sleeping',
  states: {
    sleeping: {
      meta: { stateType: 'passive' },
      on: {
        nudge: {
          actions: log('🐈‍⬛ *meow* ...what?'),
          target: 'awake',
        },
        danger: {
          actions: log('🐈‍⬛ *...*'),
          target: 'dead',
        },
      },
    },
    awake: {
      meta: { stateType: 'active' },
      on: {
        'ride.available': {
          actions: log('🐈‍⬛ *hops on* Meow!'),
          target: 'riding',
        },
        scare: {
          actions: log('🐈‍⬛ HISSSSS!'),
          target: 'scared',
        },
        danger: {
          actions: log('🐈‍⬛ *SCREEEECH*'),
          target: 'panicking',
        },
      },
    },
    riding: {
      meta: { stateType: 'active' },
      entry: log('🐈‍⬛ Purrrr...'),
      on: {
        scare: {
          target: 'panicking',
          actions: log('🐈‍⬛ *YOWL*'),
        },
        danger: {
          target: 'panicking',
          actions: log('🐈‍⬛ *jumps off* REEOOWW!'),
        },
        'ride.stopped': {
          target: 'awake',
          actions: log('🐈‍⬛ *stretches*'),
        },
      },
    },
    scared: {
      meta: { stateType: 'danger' },
      entry: log('🐈‍⬛ *ears back, tail puffed*'),
      after: { [msPerVirtualMin]: 'hidden' },
      on: { danger: 'panicking' },
    },
    panicking: {
      meta: { stateType: 'danger' },
      entry: log('🐈‍⬛ *frantically looking for escape*'),
      on: {
        escape: {
          actions: log('🐈‍⬛ *leaps through window*'),
          target: 'escaped',
        },
        hide: {
          actions: log('🐈‍⬛ *dives under couch*'),
          target: 'hidden',
        },
        die: {
          actions: log('🐈‍⬛ *...silence...*'),
          target: 'dead',
        },
      },
      after: {
        [msPerVirtualMin]: {
          actions: enqueueActions(({ system, enqueue, event }) => {
            const windowRef: WindowActor = system.get('window');
            const isWindowOpen = windowRef.getSnapshot().value === 'open';
            const isDanger = event.type === 'danger';

            enqueue.raise({ type: isWindowOpen ? 'escape' : isDanger ? 'die' : 'hide' });
          }),
        },
      },
    },
    escaped: {
      type: 'final',
      meta: { stateType: 'terminal' },
      entry: sendParent({ type: 'cat.escaped' }),
    },
    hidden: {
      meta: { stateType: 'passive' },
      entry: log('🐈‍⬛ *trembling*'),
      on: {
        danger: {
          actions: log('🐈‍⬛ *choked meow*'),
          target: 'dead',
        },
      },
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
    events: {} as { type: 'nudge' | 'candles.ignite' | 'candles.extinguish' },
  },
  guards: {
    candlesLocked: or([stateIn({ structure: 'fallen' }), stateIn({ structure: 'burning' })]),
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
            'candles.extinguish': {
              guard: not('candlesLocked'),
              target: 'extinguished',
            },
          },
        },
        extinguished: {
          on: {
            'candles.ignite': {
              guard: not('candlesLocked'),
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
              actions: [log('🎄 *wobble wobble*'), assign({ wobbleIntensity: 1 })],
              target: 'wobbling',
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
              guard: ({ context }) => context.wobbleIntensity >= 5,
              actions: log('🎄 *TIMBER!*'),
              target: 'fallen',
            },
            {
              guard: ({ context }) => context.wobbleIntensity <= 0,
              target: 'standing',
            },
          ],
          after: {
            [msPerVirtualMin * 3]: {
              actions: assign({ wobbleIntensity: ({ context }) => context.wobbleIntensity - 1 }),
              target: '.',
              reenter: true,
            },
          },
        },
        fallen: {
          meta: { stateType: 'passive' },
          entry: [log('🎄 *creaking on the floor*'), sendParent({ type: 'christmasTree.fallen' })],
          after: {
            [msPerVirtualMin * 5]: {
              guard: stateIn('candles.lit'),
              actions: log('🎄 The candles reach the carpet...'),
              target: 'burning',
            },
          },
        },
        burning: {
          meta: { stateType: 'danger' },
          entry: log('🎄 *WHOOOOSH*'),
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

type WindowActor = ActorRefFrom<typeof window>;
const window = setup({
  types: {
    meta: {} as Meta,
    events: {} as { type: 'open' | 'close' },
  },
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
  types: {
    meta: {} as Meta,
    events: {} as { type: 'push' },
  },
}).createMachine({
  initial: 'standing',
  states: {
    standing: {
      meta: { stateType: 'passive' },
      on: { push: 'fallen' },
    },
    fallen: {
      meta: { stateType: 'terminal' },
      entry: [log('🪴 *CRASH* Dirt everywhere!'), sendParent({ type: 'plant.fallen' })],
    },
  },
});

type TelevisionActor = ActorRefFrom<typeof television>;
const television = setup({
  types: {
    meta: {} as Meta,
    events: {} as { type: 'turnOn' | 'turnOff' },
  },
}).createMachine({
  initial: 'off',
  states: {
    off: {
      meta: { stateType: 'passive' },
      on: {
        turnOn: {
          actions: [
            log('📺 *static* ...'),
            sendParent(({ self }) => ({ type: 'television.turnedOn', tv: self })),
          ],
          target: 'on',
        },
      },
    },
    on: {
      meta: { stateType: 'active' },
      entry: log('📺 Playing "Die Hard: The Hallmark Edit"'),
      on: {
        turnOff: {
          actions: [
            log('📺 *click*'),
            sendParent(({ self }) => ({ type: 'television.turnedOff', tv: self })),
          ],
          target: 'off',
        },
      },
    },
  },
});

const robotMop = setup({
  types: {
    meta: {} as Meta,
    input: {} as { floor: FloorActor },
    context: {} as { floor: FloorActor },
  },
  actors: {
    dirtDetector: fromPromise<unknown, { floor: FloorActor }>(({ input }) =>
      waitFor(input.floor, (snapshot) => snapshot.matches('dirty')),
    ),
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
        log('🤖 Dirt detected. Commencing cleaning protocol.'),
        sendParent({ type: 'robotMop.cleaning' }),
        sendTo(({ context }) => context.floor, { type: 'mop' }),
      ],
      after: {
        [msPerVirtualMin * 30]: {
          actions: [
            log('🤖 Cleaning cycle complete. Returning to dock.'),
            sendTo(({ context }) => context.floor, { type: 'dry' }),
            sendParent({ type: 'robotMop.done' }),
          ],
          target: 'docked',
        },
      },
    },
  },
});

type FloorActor = ActorRefFrom<typeof floor>;
const floor = setup({
  types: {
    meta: {} as Meta,
    events: {} as
      | { type: 'dirty' }
      | { type: 'mop' }
      | { type: 'dry' }
      | { type: 'running'; from: ActorRef<Snapshot<unknown>, { type: 'slip' }, EventObject> },
  },
}).createMachine({
  initial: 'dry',
  states: {
    dry: {
      meta: { stateType: 'passive' },
      on: { dirty: 'dirty' },
    },
    dirty: {
      meta: { stateType: 'passive' },
      on: { mop: 'wet' },
    },
    wet: {
      meta: { stateType: 'danger' },
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
    meta: {} as Meta,
    context: {} as { time: number },
    events: {} as { type: 'bonked' } | { type: 'time.update'; virtualTime: number },
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
        actions: log('🍔 Order up! On my way!'),
        target: 'delivering',
      },
    },
    delivering: {
      meta: { stateType: 'active' },
      on: {
        bonked: {
          actions: log('🍔 Ow! What the - *bonk* ...pretty stars...'),
          target: 'stargazing',
        },
      },
      always: {
        guard: ({ context }) => isTime(context.time, '18:15'),
        actions: [log('🍔 Delivery complete!'), sendParent({ type: 'food.delivered' })],
        target: 'offDuty',
      },
    },
    offDuty: {
      meta: { stateType: 'passive' },
    },
    stargazing: {
      type: 'final',
      meta: { stateType: 'terminal' },
      entry: log('🍔 Zzz... so many stars...'),
    },
  },
});

type NeighborActor = ActorRefFrom<typeof neighbor>;
const neighbor = setup({
  types: {
    meta: {} as Meta,
    tags: '' as 'withinEarshot',
    events: {} as {
      type: 'sos';
      from: ActorRef<Snapshot<unknown>, { type: 'rescue' }, EventObject>;
    },
  },
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
      entry: [
        log('🙎‍♂️ Hang on, buddy! The Heimlich maneuver!'),
        sendTo(({ event }) => event.from, { type: 'rescue' }),
      ],
      after: {
        [msPerVirtualMin * 10]: {
          actions: log("🙎‍♂️ You're welcome. Merry Christmas!"),
          target: 'untanglingChristmasLights',
        },
      },
    },
  },
  on: {
    sos: {
      actions: log('🙎‍♂️ I heard someone choking!'),
      target: '.helping',
    },
  },
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
      id: 'floor',
      systemId: 'floor',
      src: 'floor',
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
      input: ({ self }) => ({ floor: self.system.get('floor') }),
      onDone: [
        {
          guard: ({ event }) => event.output.deceased === true,
          actions: raise(({ self }) => {
            const poltergeistRef: PoltergiestActorRef = self.system.get('poltergeist');
            const poltergeistMeta = mergeMeta(poltergeistRef.getSnapshot().getMeta());
            const isSpooky = poltergeistMeta.stateType === 'spooky';

            return { type: isSpooky ? 'win' : 'loose' };
          }),
        },
        {
          target: '.lost',
        },
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
        win: 'won',
        loose: 'lost',
        'plant.fallen': {
          actions: enqueueActions(({ system, enqueue }) => {
            const windowRef: WindowActor = system.get('window');
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
            sendTo('poltergeist', { type: 'home.lost' }),
          ],
        },
        'television.turnedOn': { actions: forwardTo('human') },
        'television.turnedOff': { actions: forwardTo('human') },
        'food.delivered': { actions: forwardTo('human') },
        sos: {
          actions: enqueueActions(({ system, enqueue }) => {
            const windowRef: WindowActor = system.get('window');
            const neighborRef: NeighborActor = system.get('neighbor');
            const isWindowOpen = windowRef.getSnapshot().value === 'open';
            const isNeighborAvailable = neighborRef.getSnapshot().hasTag('withinEarshot');
            const humanRef: HumanActorRef = system.get('human');

            if (isWindowOpen && isNeighborAvailable) {
              enqueue.sendTo('neighbor', { type: 'sos', from: humanRef });
            }
          }),
        },
        'robotMop.cleaning': {
          actions: sendTo('cat', { type: 'ride.available' }, { delay: msPerVirtualMin * 5 }),
        },
        'robotMop.done': {
          actions: sendTo('cat', { type: 'ride.stopped' }),
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
