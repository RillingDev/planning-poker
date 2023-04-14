import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { createMockCard, createMockCardSet } from "../test/dataFactory";
import { PokerCardList } from "./PokerCardList";

describe("PokerCardList", () => {
  it("shows cards", () => {
    const cardSet = createMockCardSet({
      cards: [
        createMockCard({ name: "Card 1" }),
        createMockCard({ name: "Card 2" }),
      ],
    });

    render(
      <PokerCardList cardSet={cardSet} activeCard={null} disabled={true} />
    );

    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
  });

  it("disables buttons", () => {
    const cardSet = createMockCardSet({
      cards: [
        createMockCard({ name: "Card 1" }),
        createMockCard({ name: "Card 2" }),
      ],
    });

    render(
      <PokerCardList cardSet={cardSet} activeCard={null} disabled={true} />
    );

    expect(screen.getByText("Card 1")).toBeDisabled();
    expect(screen.getByText("Card 2")).toBeDisabled();
  });

  it("enables buttons", () => {
    const cardSet = createMockCardSet({
      cards: [
        createMockCard({ name: "Card 1" }),
        createMockCard({ name: "Card 2" }),
      ],
    });

    render(
      <PokerCardList cardSet={cardSet} activeCard={null} disabled={false} />
    );

    expect(screen.getByText("Card 1")).not.toBeDisabled();
    expect(screen.getByText("Card 2")).not.toBeDisabled();
  });

  it("sets active card", () => {
    const card1 = createMockCard({ name: "Card 1" });
    const cardSet = createMockCardSet({
      cards: [card1, createMockCard({ name: "Card 2" })],
    });

    render(
      <PokerCardList cardSet={cardSet} activeCard={card1} disabled={false} />
    );

    expect(screen.getByText("Card 1")).toHaveClass("active");
    expect(screen.getByText("Card 2")).not.toHaveClass("active");
  });

  it("invokes click handler", async () => {
    const card1 = createMockCard({ name: "Card 1" });
    const cardSet = createMockCardSet({
      cards: [card1, createMockCard({ name: "Card 2" })],
    });

    const handleClick = vi.fn();

    render(
      <PokerCardList
        cardSet={cardSet}
        activeCard={null}
        disabled={false}
        onClick={handleClick}
      />
    );

    await userEvent.click(screen.getByText("Card 1"));

    expect(handleClick).toBeCalledWith(card1);
  });
});
