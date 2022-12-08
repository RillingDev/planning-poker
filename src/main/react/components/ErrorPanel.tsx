import { FC } from "react";
import { Alert } from "react-bootstrap";

export const ErrorPanel: FC<{
	error: Error | null;
	onClose: () => void;
}> = ({error, onClose}) => {
	return <Alert variant="danger" show={error != null} dismissible={true} onClose={onClose}>{error?.message}</Alert>;
};