import { FC, useId } from "react";
import { Button, ButtonProps, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Card } from "../model";
import "./PokerCard.css";

interface Props extends ButtonProps {
  card: Card;
}

export const PokerCard: FC<Props> = ({ card, ...props }) => {
  const button = (
    <Button className="btn-poker-card" variant="outline-dark" {...props}>
      <span className="visually-hidden">Card </span>
      {card.name}
    </Button>
  );

  const tooltipId = useId();

  if (card.description.length == 0) {
    return button;
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip id={tooltipId}>{card.description}</Tooltip>}
    >
      {button}
    </OverlayTrigger>
  );
};
