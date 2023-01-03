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


export const useInterval = (callback: () => void, timeout: number) =>
	useEffect(() => {
		const interval = setInterval(callback, timeout);
		return () => clearInterval(interval);
	}, [callback, timeout]);


export const useBooleanState = (initialState = false): [boolean, () => void, () => void] => {
	const [state, setState] = useState(initialState);
	const setTrue = useCallback(() => setState(true), []);
	const setFalse = useCallback(() => setState(false), []);

	return [state, setTrue, setFalse];
};