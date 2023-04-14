import { render, screen } from "@testing-library/react";
import { Card } from "../model";
import { PokerCard } from "./PokerCard";

describe("PokerCard", () => {
  it("shows name", () => {
    const card: Card = { name: "Foo", value: 1, description: null };

    render(<PokerCard card={card} />);

    expect(screen.getByText("Foo")).toBeInTheDocument();
  });

  it("shows description", () => {
    // TODO
  });
});
