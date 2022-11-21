import { useParams } from "react-router";
import type { FC } from "react";

export const Room: FC = () => {
	const {roomName} = useParams();
	return (
		<span>Room: {roomName}</span>
	);
};