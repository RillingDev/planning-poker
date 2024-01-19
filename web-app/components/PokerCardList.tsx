import { FC } from "react";
import { Card, CardSet } from "../model.ts";
import { PokerCard } from "./PokerCard.tsx";

export const PokerCardList: FC<{
  cardSet: CardSet;
  activeCard: Card | null;
  disabled: boolean;
  onClick?: (card: Card) => void;
}> = ({ cardSet, activeCard, disabled, onClick }) => {
  return (
    // While we could use a radio group or listbox to better convey the way this list works to screen readers,
    // The introduction text should hopefully clarify that enough.
    // Additionally, the fact that the vote is sent instantly makes it different from radio groups.
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
