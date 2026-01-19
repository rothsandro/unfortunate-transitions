import { fromPromise, setup, spawnChild, stopChild } from 'xstate';
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
  entry: spawnChild('chapter', { id: 'chapter' }),
  on: {
    reset: {
      actions: [stopChild('chapter'), spawnChild('chapter', { id: 'chapter' })],
    },
  },
});
