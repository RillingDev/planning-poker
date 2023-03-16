import { FC } from "react";
import { Card, CardSet } from "../api";
import { PokerCard } from "./PokerCard";
import "./PokerCardList.css";

export const PokerCardList: FC<{
	cardSet: CardSet,
	activeCard: Card | null,
	disabled: boolean,
	onClick?: (card: Card) => void
}> = ({cardSet, activeCard, disabled, onClick}) => {
	return (
		<ul className="poker-card-list">
			{cardSet.cards.map(card => <li key={card.name}>
				<PokerCard card={card} onClick={() => onClick?.(card)} active={card.name == activeCard?.name} disabled={disabled}/>
			</li>)}
		</ul>
	);
};
