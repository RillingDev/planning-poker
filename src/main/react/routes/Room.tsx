import { useParams } from "react-router";
import type { FC } from "react";
import { Link } from "react-router-dom";

export const Room: FC = () => {
	const {roomName} = useParams();
	return (
		<>
			<nav>
				<Link to={"/"}>Back</Link>
			</nav>
			<main>
				<span>Room: {roomName}</span>
			</main>
		</>
	);
};