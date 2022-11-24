import { useParams } from "react-router";
import type { FC } from "react";
import { Link } from "react-router-dom";
import "./Room.css";


export const Room: FC = () => {
	const {roomName} = useParams();
	return (
		<>
			<nav>
				<Link to={"/"} className="btn btn-primary">Back</Link>
			</nav>
			<header>
				<h2>{roomName}</h2>
			</header>
			<main>
			</main>

		</>
	);
};