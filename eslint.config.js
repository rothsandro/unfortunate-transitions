//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config';

export default [
  ...tanstackConfig,
  {
    rules: {
      // False positive for XState's `types: { meta: {} as Meta }` pattern, where the assertion
      // is required for type inference
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
];
