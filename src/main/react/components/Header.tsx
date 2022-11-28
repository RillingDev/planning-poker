import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import "./Header.css";

export const Header: FC = () => {
	const {user} = useContext(AppContext);

	return (
		<header className="header">
			<h1>Untitled Planing Poker Tool</h1>
			<p>Signed in as <strong>{user.username}</strong></p>
		</header>
	);
};
