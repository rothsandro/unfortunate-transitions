import { createContext, use } from 'react';
import type { ActorRefFrom } from 'xstate';
import type { rootMachine } from './actors';

export const context = createContext<ActorRefFrom<typeof rootMachine> | null>(null);

export function useRootActor() {
  const ctx = use(context);
  if (!ctx) throw new Error('RootContext used outside of RootProvider');

  return ctx;
}
