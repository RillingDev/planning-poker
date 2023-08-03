import { useCallback, useEffect, useRef, useState } from "react";

export function useErrorHandler(): [
  Error | null,
  (e: Error) => void,
  () => void,
] {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((e: Error) => {
    console.error(e);
    setError(e);
  }, []);
  const resetError = useCallback(() => setError(null), []);

  return [error, handleError, resetError];
}

export function useBooleanState(
  initialState = false,
): [boolean, () => void, () => void] {
  const [state, setState] = useState(initialState);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);

  return [state, setTrue, setFalse];
}

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback: () => void, delay: number): void {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const id = setInterval(() => savedCallback.current!(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useDocumentTitle(title: string): void {
  const previousTitleRef = useRef(document.title);
  useEffect(() => {
    document.title = title;

    return () => {
      // Intended behavior
      // eslint-disable-next-line react-hooks/exhaustive-deps
      document.title = previousTitleRef.current;
    };
  }, [title]);
}
