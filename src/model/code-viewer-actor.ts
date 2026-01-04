import { assign, fromPromise, setup } from 'xstate';
import type { CodeBlock } from '@/lib/code-parser';
import { parseCode } from '@/lib/code-parser';

export const codeViewer = setup({
  types: {
    input: {} as {
      code: string;
    },
    context: {} as {
      code: string;
      blocks: Array<CodeBlock>;
    },
  },
  actors: {
    parseCode: fromPromise<Array<CodeBlock>, { code: string }>(({ input }) =>
      parseCode(input.code),
    ),
  },
}).createMachine({
  context: ({ input }) => ({
    code: input.code,
    blocks: [],
  }),
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: 'parseCode',
        input: ({ context }) => ({ code: context.code }),
        onDone: {
          target: 'ready',
          actions: assign({
            blocks: ({ event }) => event.output,
          }),
        },
        onError: 'error',
      },
    },
    ready: {},
    error: {},
  },
});
