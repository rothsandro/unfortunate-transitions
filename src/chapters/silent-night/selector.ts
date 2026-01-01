import { useSelector } from '@xstate/react';
import { context } from './context';
import type { SnapshotFrom } from 'xstate';
import type { scene } from './actors';
import { useSafeContext } from '@/lib/context';

type Children = Required<SnapshotFrom<typeof scene>['children']>;
type ChildId = keyof Children;
type ChildSnapshot<TActor> = TActor extends { getSnapshot: () => infer TSnapshot }
  ? TSnapshot
  : undefined;

export function useChildSelector<const TId extends ChildId, TActor extends Children[TId], TResult>(
  childId: TId,
  selector: (snapshot: ChildSnapshot<TActor>) => TResult,
): [TResult, TActor] {
  const rootRef = useSafeContext(context);
  const childRef = useSelector(rootRef, (x) => x.children[childId]!) as TActor;
  const selected = useSelector<TActor, TResult>(childRef, selector);

  return [selected, childRef];
}
