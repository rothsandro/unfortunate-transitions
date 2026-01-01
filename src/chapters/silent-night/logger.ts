import { assign, setup } from 'xstate';
import type { ActionFunction } from 'xstate';

type AnyActionFunction = ActionFunction<any, any, any, any, any, any, any, any, any>;

export interface LogMessage {
  timestamp: number;
  emoji: string;
  text: string;
}

export function log(message: string): AnyActionFunction {
  return ({ system }) => {
    const emoji = message.split(' ')[0];
    const messageText = message.slice(emoji.length).trim();

    const logMessage: LogMessage = {
      emoji,
      text: messageText,
      timestamp: system.get('time').getSnapshot().context.virtualTime,
    };

    system.get('logger')?.send({ type: 'log', logMessage });
  };
}

export const logger = setup({
  types: {
    context: {} as {
      logs: Array<LogMessage>;
    },
  },
}).createMachine({
  id: 'logger',
  context: { logs: [] },
  on: {
    log: {
      actions: assign({
        logs: ({ context, event }) => [event.logMessage, ...context.logs],
      }),
    },
  },
});
