import { FC } from "react";
import { Button, ButtonProps } from "react-bootstrap";
import { Card } from "../api";
import "./PokerCard.css";

interface Props extends ButtonProps {
	card: Card;
}

export const PokerCard: FC<Props> = ({card, ...props}) => {
	return (
		<Button className="btn-poker-card" variant="outline-dark" {...props}>{card.name}</Button>
	);
};
