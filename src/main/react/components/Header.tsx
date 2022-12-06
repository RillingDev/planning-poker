import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import "./Header.css";

export const Header: FC = () => {
	const {user} = useContext(AppContext);

	return (
		<header className="header">
			<h1>Planning Poker</h1>
			<span>
				<p>Signed in as <strong>{user.username}</strong></p>
				<p><a href="/logout">Log out</a></p>
			</span>
		</header>
	);
};
