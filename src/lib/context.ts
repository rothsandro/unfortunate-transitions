import { use } from 'react';
import type { Context } from 'react';

export function useSafeContext<T>(context: Context<T | null>): T {
  const value = use(context);
  if (value === null) throw new Error('Missing context');
  return value;
}
