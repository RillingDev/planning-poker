import { FC } from "react";
import { Card, CardSet } from "../api";
import "./CardList.css";
import { PokerCard } from "./PokerCard";

export const CardList: FC<{ cardSet: CardSet, activeCard: Card | null, onClick: (card: Card) => void }> = ({cardSet, activeCard, onClick}) => {
	return (
		<ul className="card-list">
			{cardSet.cards.map(card => <li key={card.name}>
				<PokerCard card={card} onClick={() => onClick(card)} active={card.name == activeCard?.name}/>
			</li>)}
		</ul>
	);
};
