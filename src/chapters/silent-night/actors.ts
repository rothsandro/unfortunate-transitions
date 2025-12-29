import { createMachine, log, sendTo, setup } from 'xstate';

const alarmClock = createMachine({
  id: 'alarmClock',
  initial: 'armed',
  states: {
    armed: {
      on: {
        trigger: 'ringing',
      },
    },
    ringing: {
      entry: [
        log('Alarm is ringing! Wake up!'),
        sendTo(({ system }) => system.get('human'), { type: 'LOUD_NOISE' }),
      ],
      after: {
        10_000: 'off',
      },
    },
    off: {},
  },
});

const human = createMachine({
  id: 'human',
  initial: 'sleeping',
  states: {
    sleeping: {
      on: {
        LOUD_NOISE: 'awake',
      },
    },
    awake: {},
    dead: {},
  },
});

const cat = createMachine({
  id: 'cat',
  initial: 'sleeping',
  states: {
    sleeping: {},
  },
});

export const rootMachine = setup({
  types: {
    children: {} as {
      alarmClock: 'alarmClock';
      cat: 'cat';
      human: 'human';
    },
  },
  actors: { alarmClock, cat, human },
}).createMachine({
  id: 'silentNight',
  invoke: [
    {
      id: 'alarmClock',
      systemId: 'alarmClock',
      src: 'alarmClock',
    },
    {
      id: 'human',
      systemId: 'human',
      src: 'human',
    },
    {
      id: 'cat',
      systemId: 'cat',
      src: 'cat',
    },
  ],
});
