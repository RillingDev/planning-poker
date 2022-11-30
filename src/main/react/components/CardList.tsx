import { FC } from "react";
import { Card, CardSet } from "../api";
import "./CardList.css";
import Button from "react-bootstrap/Button";

export const CardList: FC<{ cardSet: CardSet, activeCard: Card | null, onClick: (card: Card) => void }> = ({cardSet, activeCard, onClick}) => {
	return (
		<ul className="card-list">
			{cardSet.cards.map(card => <li key={card.name}>
				<Button variant="light" className="poker-card" onClick={() => onClick(card)} active={card.name == activeCard?.name}>{card.name}</Button>
			</li>)}
		</ul>
	);
};
