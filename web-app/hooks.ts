import { debounce, DebouncedFunc } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";

export const useErrorHandler = (): [Error | null, (e: Error) => void, () => void] => {
	const [error, setError] = useState<Error | null>(null);

	const handleError = useCallback((e: Error) => {
		console.error(e);
		setError(e);
	}, []);
	const resetError = useCallback(() => setError(null), []);

	return [error, handleError, resetError];
};


export const useBooleanState = (initialState = false): [boolean, () => void, () => void] => {
	const [state, setState] = useState(initialState);
	const setTrue = useCallback(() => setState(true), []);
	const setFalse = useCallback(() => setState(false), []);

	return [state, setTrue, setFalse];
};


export const useInterval = (callback: () => void, timeout: number): void =>
	useEffect(() => {
		const interval = setInterval(callback, timeout);
		return () => clearInterval(interval);
	}, [callback, timeout]);


export const useDocumentTitle = (title: string): void => {
	const previousTitleRef = useRef(document.title);
	useEffect(() => {
		document.title = title;

		return () => {
			document.title = previousTitleRef.current;
		};
	}, [title]);
};


// This is probably a false positive? maybe? I think?
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useDebounce = <T extends (...args: never[]) => unknown>(fn: T, wait: number): DebouncedFunc<T> => useCallback(debounce(fn, wait), []);