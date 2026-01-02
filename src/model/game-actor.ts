import { fromPromise, setup } from 'xstate';
import type { UnknownActorLogic } from 'xstate';

export const game = setup({
  types: {
    events: {} as { type: 'reset' },
    children: {} as { chapter: 'chapter' },
  },
  actors: {
    chapter: fromPromise(() => Promise.reject('Not implemented')) as UnknownActorLogic,
  },
}).createMachine({
  initial: 'playing',
  states: {
    playing: {
      invoke: { src: 'chapter', id: 'chapter' },
      on: { reset: 'resetting' },
    },
    resetting: {
      after: {
        // XState delays stopping child actors, the new actor is created before the old one is stopped.
        // This results in duplicate IDs within the actor system. We need to delay it.
        // Using 0 would work, but results in a flicker in the UI. So we use a small delay.
        444: 'playing',
      },
    },
  },
});
