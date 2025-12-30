import { assign, createMachine, fromCallback, sendTo, setup } from 'xstate';
import type { Meta } from '@/lib/meta';
import type { ActionFunction, ActorRefFromLogic } from 'xstate';

type AnyActionFunction = ActionFunction<any, any, any, any, any, any, any, any, any>;
const log =
  (message: string): AnyActionFunction =>
  ({ system }) => {
    const loggerActorRef = system.get('logger') as ActorRefFromLogic<typeof logger> | undefined;
    loggerActorRef?.send({ type: 'log', message });
  };

const logger = setup({
  types: {
    context: {} as {
      logs: Array<string>;
    },
  },
}).createMachine({
  id: 'logger',
  context: { logs: [] },
  on: {
    log: {
      actions: assign({
        logs: ({ context, event }) => [event.message, ...context.logs],
      }),
    },
  },
});

const time = setup({
  types: {
    context: {} as { virtualTime: number },
  },
  actors: {
    ticker: fromCallback<{ type: 'tick' }>(({ sendBack }) => {
      const id = setInterval(() => sendBack({ type: 'tick' }), 1000);
      return () => clearInterval(id);
    }),
  },
  actions: {
    advanceTime: assign({
      virtualTime: ({ context }) => {
        const next = context.virtualTime + 10;
        const max = 24 * 60;
        return next >= max ? next - max : next;
      },
    }),
  },
}).createMachine({
  id: 'timer',
  context: { virtualTime: 17 * 60 },
  invoke: { src: 'ticker' },
  on: {
    tick: { actions: 'advanceTime' },
  },
});

const timeListener = fromCallback<{ type: 'time.update'; virtualTime: number }>(
  ({ sendBack, system }) => {
    const timeActorRef = system.get('time') as ActorRefFromLogic<typeof time>;
    const subscription = timeActorRef.subscribe((snapshot) => {
      sendBack({ type: 'time.update', virtualTime: snapshot.context.virtualTime });
    });
    return () => subscription.unsubscribe();
  },
);

const alarmClock = setup({
  types: {
    context: {} as {
      virtualTime: number;
    },
  },
  actors: { timeListener },
}).createMachine({
  id: 'alarmClock',
  context: { virtualTime: -1 },
  invoke: { src: 'timeListener' },
  initial: 'armed',
  on: {
    'time.update': {
      actions: assign({ virtualTime: ({ event }) => event.virtualTime }),
    },
  },
  states: {
    armed: {
      on: {
        trigger: 'ringing',
      },
      always: {
        guard: ({ context }) => context.virtualTime === 18 * 60,
        target: 'ringing',
      },
    },
    ringing: {
      entry: [
        log('Alarm is ringing! Wake up!'),
        sendTo(({ system }) => system.get('human'), { type: 'loudNoise' }),
      ],
      after: {
        10_000: 'off',
      },
    },
    off: {},
  },
});

const cat = createMachine({
  id: 'cat',
  initial: 'sleeping',
  states: {
    sleeping: {
      on: {
        nudge: 'awake',
      },
    },
    awake: {
      after: {
        2_000: 'hungry',
      },
    },
    hungry: {
      entry: log("I'm hungry!"),
      after: {
        2_000: {
          actions: [
            log("I'm so hungry, I'm gonna eat the human!"),
            sendTo(({ system }) => system.get('human'), { type: 'getsBitten' }),
          ],
        },
      },
    },
  },
});

const human = setup({
  types: {
    meta: {} as Meta,
  },
}).createMachine({
  id: 'human',
  initial: 'sleeping',
  states: {
    sleeping: {
      meta: { stateType: 'inactive' },
      on: {
        loudNoise: 'awake',
        getsBitten: 'dead',
      },
    },
    awake: {
      meta: { stateType: 'active' },
      on: {
        getsBitten: {
          actions: log('Ouch, Johnny bit me!'),
        },
      },
    },
    dead: {
      type: 'final',
    },
  },
});

const poltergeist = setup({
  types: {
    meta: {} as Meta,
  },
  actors: { timeListener },
}).createMachine({
  id: 'poltergeist',
  initial: 'mischievous',
  invoke: { src: 'timeListener' },
  on: {
    'time.update': {
      guard: ({ event }) => event.virtualTime === 0,
      target: '.failed',
    },
  },
  states: {
    mischievous: {
      meta: { stateType: 'active' },
    },
    failed: {
      type: 'final',
      meta: { stateType: 'negative' },
    },
  },
});

export const rootMachine = setup({
  types: {
    children: {} as {
      logger: 'logger';
      time: 'time';
      alarmClock: 'alarmClock';
      cat: 'cat';
      human: 'human';
      poltergeist: 'poltergeist';
    },
  },
  actors: { logger, time, alarmClock, cat, human, poltergeist },
}).createMachine({
  id: 'silentNight',
  initial: 'playing',
  states: {
    playing: {
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
        },
        {
          id: 'alarmClock',
          systemId: 'alarmClock',
          src: 'alarmClock',
        },
        {
          id: 'cat',
          systemId: 'cat',
          src: 'cat',
        },
        {
          id: 'human',
          systemId: 'human',
          src: 'human',
          onDone: 'won',
        },
        {
          id: 'poltergeist',
          systemId: 'poltergeist',
          src: 'poltergeist',
          onDone: 'lost',
        },
      ],
    },
    won: {
      type: 'final',
    },
    lost: {
      type: 'final',
    },
  },
});
