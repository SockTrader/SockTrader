import { ignoreElements, merge, Observable, tap } from 'rxjs';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { HotObservable } from 'rxjs/internal/testing/HotObservable';

export const feedObservable = <O, T>(
  toggle$: ColdObservable<T> | HotObservable<T>,
  sideEffect: (val: T) => void,
  source$: Observable<O>
): Observable<O> => {
  return merge(
    toggle$.pipe(
      tap((value: T) => sideEffect(value)),
      ignoreElements() // feed other observable
    ),
    source$ // the observable whose values we're interested in
  );
};
