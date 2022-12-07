import { render, screen } from "@testing-library/react";
import { Card } from "../../../main/react/api";
import { PokerCard } from "../../../main/react/components/PokerCard";


describe("PokerCard", () => {
	it("shows name", () => {
		const card: Card = {name: "Foo", value: 1};
		render(<PokerCard card={card}/>);
		expect(screen.getByText("Foo")).toBeInTheDocument();
	});
});
