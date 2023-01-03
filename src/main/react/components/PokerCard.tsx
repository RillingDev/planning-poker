import { FC } from "react";
import { Button, ButtonProps, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Card } from "../api";
import "./PokerCard.css";

interface Props extends ButtonProps {
	card: Card;
}

export const PokerCard: FC<Props> = ({card, ...props}) => {
	const button = <Button className="btn-poker-card" variant="outline-dark" {...props}>{card.name}</Button>;

	if (card.description == null) {
		return button;
	}

	return (
		<OverlayTrigger overlay={
			<Tooltip id={`tooltip-${card.name}`}>
				{card.description}
			</Tooltip>}>
			{button}
		</OverlayTrigger>
	);
};
