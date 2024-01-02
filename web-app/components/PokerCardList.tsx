import { FC } from "react";
import { Card, CardSet } from "../model.ts";
import { PokerCard } from "./PokerCard.tsx";

// TODO: use listbox or radio buttons for a11y
export const PokerCardList: FC<{
  cardSet: CardSet;
  activeCard: Card | null;
  disabled: boolean;
  onClick?: (card: Card) => void;
}> = ({ cardSet, activeCard, disabled, onClick }) => {
  return (
    <ul className="list-unstyled mb-0 p-3 d-flex flex-wrap justify-content-center gap-2">
      {cardSet.cards.map((card) => (
        <li key={card.name}>
          <PokerCard
            card={card}
            onClick={() => onClick?.(card)}
            active={card.name == activeCard?.name}
            disabled={disabled}
          />
        </li>
      ))}
    </ul>
  );
};
