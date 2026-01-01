export type StateType = 'spooky' | 'active' | 'passive' | 'danger' | 'terminal';

export interface Meta {
  stateType?: StateType;
}

export function mergeMeta(meta: Record<string, Meta | undefined>) {
  return Object.values(meta).reduce<Meta>((acc, curr) => Object.assign(acc, curr), {});
}
