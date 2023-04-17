import { render, screen } from "@testing-library/react";
import { Card } from "../model";
import { PokerCard } from "./PokerCard";
import userEvent from "@testing-library/user-event";

describe("PokerCard", () => {
  it("shows name", () => {
    const card: Card = { name: "Foo", value: 1, description: null };

    render(<PokerCard card={card} />);

    expect(screen.getByText("Foo")).toBeInTheDocument();
  });

  it("shows description", async () => {
    const card: Card = {name: "Foo", value: 1, description: "Foo Bar!"};

    render(<PokerCard card={card}/>);

    expect(screen.queryByText("Foo Bar!")).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText("Foo"))

    expect(screen.queryByText("Foo Bar!")).toBeVisible();
  });
});
