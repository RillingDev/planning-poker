import { render, screen } from "@testing-library/react";
import { Card, CardSet } from "../api";
import { CardList } from "./CardList";


describe("CardList", () => {
	it("shows cards", () => {
		const cardSet: CardSet = {
			name: "Set",
			cards: [{name: "Card 1", value: 1, description: null}, {name: "Card 2", value: 2, description: null}]
		};

		render(<CardList cardSet={cardSet} activeCard={null} disabled={true}/>);

		expect(screen.getByText("Card 1")).toBeInTheDocument();
		expect(screen.getByText("Card 2")).toBeInTheDocument();
	});


	it("disables buttons", () => {
		const cardSet: CardSet = {
			name: "Set",
			cards: [{name: "Card 1", value: 1, description: null}, {name: "Card 2", value: 2, description: null}]
		};

		render(<CardList cardSet={cardSet} activeCard={null} disabled={true}/>);

		expect(screen.getByText("Card 1")).toBeDisabled();
		expect(screen.getByText("Card 2")).toBeDisabled();
	});

	it("enables buttons", () => {
		const cardSet: CardSet = {
			name: "Set",
			cards: [{name: "Card 1", value: 1, description: null}, {name: "Card 2", value: 2, description: null}]
		};

		render(<CardList cardSet={cardSet} activeCard={null} disabled={false}/>);

		expect(screen.getByText("Card 1")).not.toBeDisabled();
		expect(screen.getByText("Card 2")).not.toBeDisabled();
	});

	it("sets active card", () => {
		const card1: Card = {name: "Card 1", value: 1, description: null};
		const cardSet: CardSet = {name: "Set", cards: [card1, {name: "Card 2", value: 2, description: null}]};

		render(<CardList cardSet={cardSet} activeCard={card1} disabled={false}/>);

		expect(screen.getByText("Card 1")).toHaveClass("active");
		expect(screen.getByText("Card 2")).not.toHaveClass("active");
	});
});
