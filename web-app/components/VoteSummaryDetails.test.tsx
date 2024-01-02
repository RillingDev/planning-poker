import { render, screen, within } from "@testing-library/react";
import { VoteSummary } from "../model.ts";
import {
  createMockCard,
  createMockCardSet,
  createMockContextState,
  createMockExtension,
  createMockRoom,
  createMockRoomMember,
} from "../test/dataFactory.tsx";
import { VoteSummaryDetails } from "./VoteSummaryDetails.tsx";
import { AppContext } from "../AppContext.ts";
import { FC } from "react";
import { describe, expect, it } from "vitest";

describe("VoteSummaryDetails", () => {
  it("shows 'no results' if no summary exists", () => {
    const cardSet = createMockCardSet({});
    const room = createMockRoom({ cardSetName: cardSet.name });

    render(<VoteSummaryDetails room={room} voteSummary={null} />);

    expect(screen.getByText("No result")).toBeInTheDocument();
  });

  it("shows average", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card1,
      offset: 4,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    expect(screen.getByText("Average:")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
  });

  it("hides average if not available", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: null,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card1,
      offset: 4,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    expect(screen.queryByText("Average:")).not.toBeInTheDocument();
  });

  it("shows nearest", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const card3 = createMockCard({ value: 3, name: "Three" });
    const cardSet = createMockCardSet({ cards: [card1, card3, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card3,
      offset: 4,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    expect(screen.getByText("Nearest Card:")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("hides nearest if not available", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const card3 = createMockCard({ value: 3, name: "Three" });
    const cardSet = createMockCardSet({ cards: [card1, card3, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: null,
      offset: 4,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    expect(screen.queryByText("Nearest Card:")).not.toBeInTheDocument();
  });

  it("shows extremes", () => {
    const card1 = createMockCard({ value: 1, name: "Low Card" });
    const card5 = createMockCard({ value: 5, name: "High Card" });
    const card3 = createMockCard({ value: 3 });
    const cardSet = createMockCardSet({ cards: [card1, card3, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card3,
      offset: 4,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    const summaryHighest = screen.getByTestId("summary-highest");
    expect(within(summaryHighest).getByText("Alice")).toBeInTheDocument();
    expect(within(summaryHighest).getByText("High Card")).toBeInTheDocument();
    const summaryLowest = screen.getByTestId("summary-lowest");
    expect(within(summaryLowest).getByText("Bob")).toBeInTheDocument();
    expect(within(summaryLowest).getByText("Low Card")).toBeInTheDocument();
  });

  it("shows offset", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card1,
      offset: 999,
    };

    render(<VoteSummaryDetails room={room} voteSummary={voteSummary} />);

    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows extensions", () => {
    const MockSubmitComponent: FC = () => {
      return <span>Mock Extension Submit Component</span>;
    };
    const extension = createMockExtension({
      SubmitComponent: MockSubmitComponent,
      key: "mockExtension",
    });

    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberBob = createMockRoomMember({
      username: "Bob",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberBob, memberAlice],
      extensions: ["mockExtension"],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowest: { card: card1, members: [memberBob] },
      highest: { card: card5, members: [memberAlice] },
      nearestCard: card1,
      offset: 999,
    };

    render(
      <AppContext.Provider
        value={createMockContextState({
          enabledExtensions: [extension],
        })}
      >
        <VoteSummaryDetails room={room} voteSummary={voteSummary} />
      </AppContext.Provider>,
    );

    expect(
      screen.getByText("Mock Extension Submit Component"),
    ).toBeInTheDocument();
  });
});
