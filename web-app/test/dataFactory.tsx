/* eslint-disable react-refresh/only-export-components */
import { AppContextState } from "../AppContext.ts";
import {
  Card,
  CardSet,
  Role,
  Room,
  RoomMember,
  VoteSummary,
} from "../model.ts";
import { Extension } from "../extension/Extension.ts";
import { FC } from "react";

export function createMockCard(values: Partial<Card>): Card {
  return {
    name: values.name ?? "Card",
    description: values.description ?? "",
    value: values.value ?? null,
  };
}

export function createMockCardSet(values: Partial<CardSet>): CardSet {
  return {
    name: values.name ?? "Card Set",
    cards: values.cards ?? [],
  };
}

export function createMockRoomMember(values: Partial<RoomMember>): RoomMember {
  return {
    username: values.username ?? "Bob",
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
    topic: values.topic ?? "",
  };
}

export function createMockVoteSummary(
  values: Partial<VoteSummary>,
): VoteSummary {
  const card1 = createMockCard({ name: "1", value: 1 });
  const card3 = createMockCard({ name: "3", value: 3 });
  const memberLow = createMockRoomMember({ username: "Foo", vote: card1 });
  const memberHigh = createMockRoomMember({ username: "Bar", vote: card3 });
  return {
    average: values.average ?? 2,
    highest: {
      card: values.highest?.card ?? card3,
      members: values.highest?.members ?? [memberHigh],
    },
    lowest: {
      card: values.lowest?.card ?? card1,
      members: values.lowest?.members ?? [memberLow],
    },
    nearestCard: values.nearestCard ?? card3,
    offset: values.offset ?? 1,
  };
}

const MockRoomComponent: FC = () => {
  return <span>Mock Extension Room Component</span>;
};

const MockSubmitComponent: FC = () => {
  return <span>Mock Extension Submit Component</span>;
};

export function createMockExtension(values: Partial<Extension>): Extension {
  return {
    RoomComponent: values.RoomComponent ?? MockRoomComponent,
    SubmitComponent: values.SubmitComponent ?? MockSubmitComponent,
    key: values.key ?? "mockExtension",
    label: values.label ?? "Mock Extension",
  };
}

export function createMockContextState(
  values: Partial<AppContextState>,
): AppContextState {
  return {
    user: values.user ?? { username: "Bob" },
    cardSets: values.cardSets ?? [],
    enabledExtensions: values.enabledExtensions ?? [],
  };
}
