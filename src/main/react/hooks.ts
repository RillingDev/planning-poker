import { useEffect, useState } from "react";

export const useErrorHandler = (): [Error | null, (e: Error) => void, () => void] => {
	const [error, setError] = useState<Error | null>(null);

	const handleError = (e: Error) => {
		console.error(e);
		setError(e);
	};
	const resetError = () => setError(null);

	return [error, handleError, resetError];
};

export const useInterval = (callback: () => void, timeout: number) => {
	useEffect(() => {
		const interval = setInterval(callback, timeout);
		return () => clearInterval(interval);
	}, [callback, timeout]);
};