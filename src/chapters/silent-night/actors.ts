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
      entry: log('👻 NO! My home... burned to ashes!'),
      meta: { stateType: 'terminal' },
    },
  },
});

const human = setup({
  types: {
    meta: {} as Meta,
    context: {} as { hungerLevel: number; tv: ActorRefFromLogic<typeof television> | null },
    output: {} as { deceased: boolean },
  },
  actors: {
    getHungry: fromCallback(({ sendBack }) => {
      const id = setInterval(() => sendBack({ type: 'incrementHunger' }), msPerVirtualMin);
      return () => clearInterval(id);
    }),
  },
  actions: {
    incrementHunger: assign({
      hungerLevel: ({ context }) => context.hungerLevel + 1,
    }),
  },
}).createMachine({
  id: 'human',
  context: { hungerLevel: 0, tv: null },
  initial: 'awake',
  states: {
    awake: {
      meta: { stateType: 'active' },
      invoke: { src: 'getHungry' },
      always: {
        guard: ({ context }) => context.hungerLevel >= 100,
        actions: log("🤵‍♂️ I'm getting hungry..."),
        target: 'preparingMeal',
      },
      on: {
        'food.delivered': {
          target: 'eating',
          actions: log('🤵‍♂️ Oh, my food is here!'),
        },
        'cat.inDanger': {
          target: 'rushing',
          actions: log('🤵‍♂️ Snowball! Come back!'),
        },
        'house.onFire': {
          target: 'rushing',
          actions: log('🤵‍♂️ FIRE! I need to get out!'),
        },
        'television.turnedOn': {
          target: 'watchingTelevision',
          actions: [assign({ tv: ({ event }) => event.tv }), log('🤵‍♂️ Ah, time to relax!')],
        },
      },
    },
    watchingTelevision: {
      meta: { stateType: 'active' },
      invoke: { src: 'getHungry' },
      after: {
        [msPerVirtualMin * 30]: {
          target: 'awake',
          actions: [
            log('🤵‍♂️ That was a good movie. Time to do something else.'),
            sendTo(({ context }) => context.tv!, { type: 'turnOff' }),
          ],
        },
      },
      on: {
        'food.delivered': {
          target: 'eating',
          actions: log('🤵‍♂️ Oh, my food is here!'),
        },
        'house.onFire': {
          target: 'rushing',
          actions: log('🤵‍♂️ FIRE! I need to get out!'),
        },
        'television.turnedOff': {
          target: 'awake',
          actions: log('🤵‍♂️ Huh? The TV turned off?'),
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
              guard: ({ context }) => context.hungerLevel >= 100,
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
          entry: log("🤵‍♂️ I'm starving! Gotta eat faster!"),
          after: {
            [msPerVirtualMin * 10]: {
              actions: assign({ hungerLevel: -500 }),
              target: '#human.choking',
            },
          },
        },
      },
      on: {
        'house.onFire': {
          target: 'rushing',
          actions: log('🤵‍♂️ THE HOUSE IS ON FIRE!'),
        },
      },
      always: {
        guard: ({ context }) => context.hungerLevel <= 0,
        actions: [assign({ hungerLevel: -200 }), log('🤵‍♂️ *yawn* Time for a nap...')],
        target: 'sleeping',
      },
    },
    preparingMeal: {
      meta: { stateType: 'active' },
      entry: log('🤵‍♂️ Gotta prepare something to eat...'),
      on: {
        'house.onFire': {
          target: 'rushing',
          actions: log('🤵‍♂️ Are you kidding me?! FIRE!'),
        },
      },
      after: {
        [msPerVirtualMin * 15]: {
          target: 'eating',
          actions: log('🤵‍♂️ Finally, dinner is ready!'),
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
          target: 'dead',
          actions: log('🤵‍♂️ *silence*'),
        },
      },
      on: {
        rescued: {
          target: '#human.awake',
          actions: log('🤵‍♂️ *cough* Thank you, Gary!'),
        },
        'house.onFire': {
          target: 'dead',
          actions: log("🤵‍♂️ Can't breathe... fire... *choke*"),
        },
      },
    },
    rushing: {
      meta: { stateType: 'active' },
      entry: log('🤵‍♂️ Running as fast as I can!'),
      after: {
        [msPerVirtualMin]: {
          actions: sendTo(
            ({ system }) => system.get('floor'),
            ({ self }) => ({ type: 'running', from: self }),
          ),
        },
        [msPerVirtualMin * 3]: {
          target: 'leftHouse',
          actions: log('🤵‍♂️ Made it out! ...but at what cost?'),
        },
      },
      on: {
        slip: {
          target: 'slipping',
          actions: log('🤵‍♂️ Wha... *SLIP*'),
        },
      },
    },
    sleeping: {
      meta: { stateType: 'passive' },
      entry: log('🤵‍♂️ Zzz... zzz...'),
      on: {
        'house.onFire': {
          target: 'dead',
          actions: log('🤵‍♂️ Zzz... *cough* ...zzz...'),
        },
      },
    },
    slipping: {
      meta: { stateType: 'danger' },
      entry: log('🤵‍♂️ AAAHHH *CRASH*'),
      after: {
        [msPerVirtualMin]: {
          target: 'dead',
          actions: log('🤵‍♂️ Everything... hurts...'),
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
    incrementHunger: { actions: 'incrementHunger' },
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
      on: {
        nudge: {
          target: 'awake',
          actions: log('🐈‍⬛ *meow* ...what?'),
        },
        danger: {
          target: 'dead',
          actions: log('🐈‍⬛ *...*'),
        },
      },
    },
    awake: {
      meta: { stateType: 'active' },
      on: {
        rideAvailable: {
          target: 'riding',
          actions: log('🐈‍⬛ *hops on* Meow!'),
        },
        scare: {
          target: 'scared',
          actions: log('🐈‍⬛ HISSSSS!'),
        },
        danger: {
          target: 'panicking',
          actions: log('🐈‍⬛ *SCREEEECH*'),
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
        rideStopped: {
          target: 'awake',
          actions: log('🐈‍⬛ *stretches*'),
        },
      },
    },
    scared: {
      meta: { stateType: 'danger' },
      entry: log('🐈‍⬛ *ears back, tail puffed*'),
      after: {
        [msPerVirtualMin]: 'hidden',
      },
      on: { danger: 'panicking' },
    },
    panicking: {
      meta: { stateType: 'danger' },
      entry: log('🐈‍⬛ *frantically looking for escape*'),
      on: {
        escape: {
          target: 'escaped',
          actions: log('🐈‍⬛ *leaps through window*'),
        },
        hide: {
          target: 'hidden',
          actions: log('🐈‍⬛ *dives under couch*'),
        },
        die: {
          target: 'dead',
          actions: log('🐈‍⬛ *...silence...*'),
        },
      },
      after: {
        [msPerVirtualMin]: {
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
      entry: log('🐈‍⬛ *trembling*'),
      on: {
        danger: {
          target: 'dead',
          actions: log('🐈‍⬛ *choked meow*'),
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
              actions: [assign({ wobbleIntensity: 1 }), log('🎄 *wobble wobble*')],
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
              target: '.',
              reenter: true,
              actions: assign({ wobbleIntensity: ({ context }) => context.wobbleIntensity - 1 }),
            },
          },
        },
        fallen: {
          meta: { stateType: 'passive' },
          entry: [sendParent({ type: 'christmasTree.fallen' }), log('🎄 *creaking on the floor*')],
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
          actions: [sendParent({ type: 'plant.falling' }), log('🪴 *CRASH* Dirt everywhere!')],
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
        log('🤖 Dirt detected. Commencing cleaning protocol.'),
      ],
      after: {
        [msPerVirtualMin * 30]: {
          actions: [
            sendParent({ type: 'robotMop.done' }),
            sendTo(({ context }) => context.floor, { type: 'dry' }),
            log('🤖 Cleaning cycle complete. Returning to dock.'),
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
        actions: log('🍔 Order up! On my way!'),
        target: 'delivering',
      },
    },
    delivering: {
      meta: { stateType: 'active' },
      on: {
        bonked: {
          target: 'stargazing',
          actions: log('🍔 Ow! What the - *bonk* ...pretty stars...'),
        },
      },
      always: {
        guard: ({ context }) => isTime(context.time, '18:15'),
        actions: [sendParent({ type: 'food.delivered' }), log('🍔 Delivery complete!')],
        target: 'offDuty',
      },
    },
    offDuty: {
      meta: { stateType: 'passive' },
    },
    stargazing: {
      type: 'final',
      entry: log('🍔 Zzz... so many stars...'),
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
      entry: [
        sendTo(({ event }) => event.from, { type: 'rescued' }),
        log('🙎‍♂️ Hang on, buddy! The Heimlich maneuver!'),
      ],
      after: {
        [msPerVirtualMin * 10]: {
          target: 'untanglingChristmasLights',
          actions: log("🙎‍♂️ You're welcome. Merry Christmas!"),
        },
      },
    },
  },
  on: {
    sos: {
      target: '.helping',
      actions: log('🙎‍♂️ I heard someone choking!'),
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
        'television.turnedOn': { actions: forwardTo('human') },
        'television.turnedOff': { actions: forwardTo('human') },
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
