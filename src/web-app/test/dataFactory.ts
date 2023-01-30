import { Card, CardSet, Role, Room, RoomMember } from "../api";
import { AppContextState } from "../AppContext";
import { ExtensionManager } from "../extension/ExtensionManager";

export function createContextState(values: Partial<AppContextState>): AppContextState {
	return {
		user: values.user ?? {username: "John Doe"},
		cardSets: values.cardSets ?? [],
		extensionManager: values.extensionManager ?? new ExtensionManager([])
	};
}

export function createCard(values: Partial<Card>): Card {
	return {name: values.name ?? "Card", description: values.description ?? null, value: values.value ?? null};
}

export function createCardSet(values: Partial<CardSet>): CardSet {
	return {name: values.name ?? "Card Set", cards: values.cards ?? [], relevantFractionDigits: values.relevantFractionDigits ?? 1};
}

export function createRoomMember(values: Partial<RoomMember>): RoomMember {
	return {username: values.username ?? "John Doe", vote: values.vote ?? null, role: values.role ?? Role.VOTER};
}

export function createRoom(values: Partial<Room>): Room {
	return {
		name: values.name ?? "Room",
		cardSetName: values.cardSetName ?? "Card Set",
		members: values.members ?? [],
		extensions: values.extensions ?? [],
		votingClosed: values.votingClosed ?? false,
		topic: values.topic ?? null
	};
}