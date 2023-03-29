import { render, screen } from "@testing-library/react";
import { VoteSummary } from "../model";
import {
  createCard,
  createCardSet,
  createRoom,
  createRoomMember,
} from "../test/dataFactory";
import { Summary } from "./Summary";

describe("Summary", () => {
  it("shows 'no results' if no summary exists", () => {
    const cardSet = createCardSet({});
    const room = createRoom({ cardSetName: cardSet.name });

    render(<Summary room={room} voteSummary={null} cardSet={cardSet} />);

    expect(screen.getByText("No result")).toBeInTheDocument();
  });

  it("shows average", () => {
    const card1 = createCard({ value: 1 });
    const card5 = createCard({ value: 5 });
    const cardSet = createCardSet({ cards: [card1, card5] });

    const memberJohnDoe = createRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createRoomMember({ username: "Alice", vote: card5 });
    const room = createRoom({
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
    const card1 = createCard({ value: 1 });
    const card5 = createCard({ value: 5 });
    const cardSet = createCardSet({
      cards: [card1, card5],
      relevantFractionDigits: 0,
    });

    const memberJohnDoe = createRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createRoomMember({ username: "Alice", vote: card5 });
    const room = createRoom({
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
    const card1 = createCard({ value: 1 });
    const card5 = createCard({ value: 5 });
    const card3 = createCard({ value: 3, name: "Three" });
    const cardSet = createCardSet({ cards: [card1, card3, card5] });

    const memberJohnDoe = createRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createRoomMember({ username: "Alice", vote: card5 });
    const room = createRoom({
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
    const card1 = createCard({ value: 1, name: "Low Card" });
    const card5 = createCard({ value: 5, name: "High Card" });
    const card3 = createCard({ value: 3 });
    const cardSet = createCardSet({ cards: [card1, card3, card5] });

    const memberJohnDoe = createRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createRoomMember({ username: "Alice", vote: card5 });
    const room = createRoom({
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

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Low Card")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("High Card")).toBeInTheDocument();
  });

  it("shows offset", () => {
    const card1 = createCard({ value: 1 });
    const card5 = createCard({ value: 5 });
    const cardSet = createCardSet({ cards: [card1, card5] });

    const memberJohnDoe = createRoomMember({
      username: "John Doe",
      vote: card1,
    });
    const memberAlice = createRoomMember({ username: "Alice", vote: card5 });
    const room = createRoom({
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
});
