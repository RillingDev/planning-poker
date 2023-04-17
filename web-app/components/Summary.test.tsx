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
import { Summary } from "./Summary";
import { AppContext } from "../AppContext";
import { ExtensionManager } from "../extension/ExtensionManager";
import { FC } from "react";

describe("Summary", () => {
  it("shows 'no results' if no summary exists", () => {
    const cardSet = createMockCardSet({});
    const room = createMockRoom({ cardSetName: cardSet.name });

    render(<Summary room={room} voteSummary={null} cardSet={cardSet} />);

    expect(screen.getByText("No result")).toBeInTheDocument();
  });

  it("shows average", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card1,
      offset: 4,
    };

    render(<Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />);

    expect(screen.getByText("2.5")).toBeInTheDocument();
  });

  it("formats average", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({
      cards: [card1, card5],
      relevantFractionDigits: 0,
    });

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.9,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card1,
      offset: 4,
    };

    render(<Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows nearest", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const card3 = createMockCard({ value: 3, name: "Three" });
    const cardSet = createMockCardSet({ cards: [card1, card3, card5] });

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card3,
      offset: 4,
    };

    render(<Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />);

    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("shows extremes", () => {
    const card1 = createMockCard({ value: 1, name: "Low Card" });
    const card5 = createMockCard({ value: 5, name: "High Card" });
    const card3 = createMockCard({ value: 3 });
    const cardSet = createMockCardSet({ cards: [card1, card3, card5] });

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card3,
      offset: 4,
    };

    const { container } = render(
      <Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />
    );

    const summaryHighest = container.querySelector(
      ".summary__highest"
    ) as HTMLElement;
    expect(getByText(summaryHighest, "Alice")).toBeInTheDocument();
    expect(getByText(summaryHighest, "High Card")).toBeInTheDocument();
    const summaryLowest = container.querySelector(
      ".summary__lowest"
    ) as HTMLElement;
    expect(getByText(summaryLowest, "John Doe")).toBeInTheDocument();
    expect(getByText(summaryLowest, "Low Card")).toBeInTheDocument();
  });

  it("shows offset", () => {
    const card1 = createMockCard({ value: 1 });
    const card5 = createMockCard({ value: 5 });
    const cardSet = createMockCardSet({ cards: [card1, card5] });

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card1,
      offset: 999,
    };

    render(<Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />);

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

    const memberJohnDoe = createMockRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createMockRoomMember({
      username: "Alice",
      vote: card5,
    });
    const room = createMockRoom({
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [memberJohnDoe, memberAlice],
      extensions: ["mockExtension"],
    });
    const voteSummary: VoteSummary = {
      average: 2.5,
      lowestVote: card1,
      lowestVoters: [memberJohnDoe],
      highestVote: card5,
      highestVoters: [memberAlice],
      nearestCard: card1,
      offset: 999,
    };

    render(
      <AppContext.Provider
        value={createMockContextState({
          extensionManager,
        })}
      >
        <Summary room={room} voteSummary={voteSummary} cardSet={cardSet} />
      </AppContext.Provider>
    );

    expect(
      screen.getByText("Mock Extension Submit Component")
    ).toBeInTheDocument();
  });
});
