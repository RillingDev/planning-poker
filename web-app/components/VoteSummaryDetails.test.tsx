import { getByText, render, screen } from "@testing-library/react";
import { VoteSummary } from "../model";
import {
  createMockCard,
  createMockCardSet,
  createMockContextState,
  createMockExtension,
  createMockRoom,
  createMockRoomMember,
} from "../test/dataFactory";
import { VoteSummaryDetails } from "./VoteSummaryDetails.tsx";
import { AppContext } from "../AppContext";
import { ExtensionManager } from "../extension/ExtensionManager";
import { FC } from "react";

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

    const { container } = render(
      <VoteSummaryDetails room={room} voteSummary={voteSummary} />,
    );

    const summaryHighest = container.querySelector(".summary__highest")!;
    expect(getByText(summaryHighest, "Alice")).toBeInTheDocument();
    expect(getByText(summaryHighest, "High Card")).toBeInTheDocument();
    const summaryLowest = container.querySelector(".summary__lowest")!;
    expect(getByText(summaryLowest, "Bob")).toBeInTheDocument();
    expect(getByText(summaryLowest, "Low Card")).toBeInTheDocument();
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
    const extensionManager = new ExtensionManager([extension]);

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
          extensionManager,
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
