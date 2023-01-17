import { useCallback, useEffect, useState } from "react";

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
	useEffect(() => {
		document.title = title;
	}, [title]);
};

export const useAsyncData = <T>(asyncFn: () => Promise<T>): [T | null, () => Promise<void>, boolean] => {
	const [pending, setPending] = useState(false);
	const [result, setResult] = useState<T | null>(null);

	const decoratedAsyncFn = useCallback(async () => {
		if (result != null) {
			return;
		}

		setPending(true);
		try {
			setResult(await asyncFn());
		} finally {
			setPending(false);
		}
	}, [asyncFn, result]);

	return [result, decoratedAsyncFn, pending];
};