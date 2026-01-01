import { assign, fromCallback, setup } from 'xstate';
import { msPerVirtualMin } from './config';
import type { ActorRefFromLogic } from 'xstate';

export const time = setup({
  types: {
    context: {} as { virtualTime: number },
  },
  actors: {
    ticker: fromCallback<{ type: 'tick' }>(({ sendBack }) => {
      const id = setInterval(() => sendBack({ type: 'tick' }), msPerVirtualMin);
      return () => clearInterval(id);
    }),
  },
  actions: {
    advanceTime: assign({
      virtualTime: ({ context }) => {
        const next = context.virtualTime + 1;
        const max = 24 * 60;
        return next > max ? next - max : next;
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

export const timeListener = fromCallback<{ type: 'time.update'; virtualTime: number }>(
  ({ sendBack, system }) => {
    const timeActorRef = system.get('time') as ActorRefFromLogic<typeof time>;
    const subscription = timeActorRef.subscribe((snapshot) => {
      sendBack({ type: 'time.update', virtualTime: snapshot.context.virtualTime });
    });
    return () => subscription.unsubscribe();
  },
);
