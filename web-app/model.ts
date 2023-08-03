export type ExtensionKey = string;

export const enum Role {
  VOTER = "VOTER",
  OBSERVER = "OBSERVER",
}

export interface User {
  readonly username: string;
}

export interface RoomMember {
  readonly username: string;
  readonly role: Role;
  readonly vote: Card | null;
}

export interface Room {
  readonly name: string;
  readonly topic: string | null;
  readonly cardSetName: string;
  readonly members: readonly RoomMember[];
  readonly votingClosed: boolean;
  readonly extensions: readonly ExtensionKey[];
}

export interface Card {
  readonly name: string;
  readonly value: number | null;
  readonly description: string | null;
}

export interface CardSet {
  readonly name: string;
  readonly cards: readonly Card[];
}

export interface SummaryResult {
  readonly votes: VoteSummary | null;
}

export interface VoteSummary {
  readonly average: number | null;
  readonly offset: number;
  readonly nearestCard: Card | null;
  readonly highest: VoteExtreme | null;
  readonly lowest: VoteExtreme | null;
}

export interface VoteExtreme {
  readonly card: Card;
  readonly members: readonly RoomMember[];
}

export type RoomCreationOptions = Pick<Room, "cardSetName">;
export type RoomEditOptions = Partial<
  Pick<Room, "topic" | "cardSetName" | "extensions">
>;

export const enum EditAction {
  SET_VOTER = "SET_VOTER",
  SET_OBSERVER = "SET_OBSERVER",
  KICK = "KICK",
}
