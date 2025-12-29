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
        sendTo(({ system }) => system.get('human'), { type: 'loudNoise' }),
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
        loudNoise: 'awake',
        getsBitten: 'dead',
      },
    },
    awake: {
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
  initial: 'playing',
  states: {
    playing: {
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
          onDone: 'won',
        },
        {
          id: 'cat',
          systemId: 'cat',
          src: 'cat',
        },
      ],
    },
    won: {
      type: 'final',
    },
  },
});
