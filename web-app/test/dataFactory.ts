import { AppContextState } from "../AppContext";
import { ExtensionManager } from "../extension/ExtensionManager";
import { Card, CardSet, Role, Room, RoomMember, VoteSummary } from "../model";

export function createMockContextState(
  values: Partial<AppContextState>
): AppContextState {
  return {
    user: values.user ?? { username: "John Doe" },
    cardSets: values.cardSets ?? [],
    extensionManager: values.extensionManager ?? new ExtensionManager([]),
  };
}

export function createMockCard(values: Partial<Card>): Card {
  return {
    name: values.name ?? "Card",
    description: values.description ?? null,
    value: values.value ?? null,
  };
}

export function createMockCardSet(values: Partial<CardSet>): CardSet {
  return {
    name: values.name ?? "Card Set",
    cards: values.cards ?? [],
    relevantFractionDigits: values.relevantFractionDigits ?? 1,
  };
}

export function createMockRoomMember(values: Partial<RoomMember>): RoomMember {
  return {
    username: values.username ?? "John Doe",
    vote: values.vote ?? null,
    role: values.role ?? Role.VOTER,
  };
}

export function createMockRoom(values: Partial<Room>): Room {
  return {
    name: values.name ?? "Room",
    cardSetName: values.cardSetName ?? "Card Set",
    members: values.members ?? [],
    extensions: values.extensions ?? [],
    votingClosed: values.votingClosed ?? false,
    topic: values.topic ?? null,
  };
}

export function createMockVoteSummary(values: Partial<VoteSummary>): VoteSummary {
  const card1 = createMockCard({ name: "1", value: 1 });
  const card3 = createMockCard({ name: "3", value: 3 });
  const memberLow = createMockRoomMember({ username: "Foo", vote: card1 });
  const memberHigh = createMockRoomMember({ username: "Bar", vote: card3 });
  return {
    average: values.average ?? 2,
    highestVote: values.highestVote ?? card3,
    highestVoters: values.highestVoters ?? [memberHigh],
    lowestVote: values.lowestVote ?? card1,
    lowestVoters: values.lowestVoters ?? [memberLow],
    nearestCard: values.nearestCard ?? card3,
    offset: values.offset ?? 1,
  };
}
