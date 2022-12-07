import { isStatusOk, MEDIA_TYPE_JSON } from "./apiUtils";

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
	readonly cardSet: CardSet;
	readonly members: ReadonlyArray<RoomMember>;
	readonly votingComplete: boolean;
}

export interface Card {
	readonly name: string;
	readonly value: number | null;
}

export interface CardSet {
	readonly name: string;
	readonly cards: ReadonlyArray<Card>;
}

export interface VoteSummary {
	readonly average: number;
	readonly offset: number;
	readonly nearestCard: Card;
	readonly highestVote: Card;
	readonly highestVoters: ReadonlyArray<RoomMember>;
	readonly lowestVote: Card;
	readonly lowestVoters: ReadonlyArray<RoomMember>;
}

async function assertStatusOk(res: Response): Promise<Response> {
	if (isStatusOk(res)) {
		return res;
	}

	if (res.status == 403) {
		throw new Error("Missing permissions. This may be because you were kicked from the room. Please go back to the room list.");
	}
	if (res.status == 404) {
		throw new Error("Not found. This may be because this room was deleted in the mean time. Please go back to the room list.");
	}

	const body = await res.text();
	throw new Error(
		`Unexpected status code '${res.status}':
		${body}.`,
	);
}

export async function loadIdentity() {
	return fetch("/api/identity", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<User>);
}

export async function loadExtensions() {
	return fetch("/api/extensions", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<ReadonlyArray<string>>);
}

export async function loadCardSets() {
	return fetch("/api/card-sets", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON},
	}).then(assertStatusOk).then(res => res.json() as Promise<CardSet[]>);
}


export async function loadRooms() {
	return fetch("/api/rooms", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<Room[]>);
}

export async function createRoom(roomName: string, roomTopic: string, cardSetName: string) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}`, location.href);
	if (roomTopic != null) {
		url.searchParams.set("room-topic", roomTopic);
	}
	url.searchParams.set("card-set-name", cardSetName);
	return fetch(url, {
		method: "POST"
	}).then(assertStatusOk);
}

export async function deleteRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
		method: "DELETE",
	}).then(assertStatusOk);
}

export async function editRoom(roomName: string, roomTopic: string | null, cardSetName: string | null) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}`, location.href);
	if (roomTopic != null) {
		url.searchParams.set("room-topic", roomTopic);
	}
	if (cardSetName != null) {
		url.searchParams.set("card-set-name", cardSetName);
	}
	return fetch(url, {
		method: "PATCH",
	}).then(assertStatusOk);
}


export async function joinRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
		method: "POST",
	}).then(assertStatusOk);
}

export async function leaveRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
		method: "DELETE",
	}).then(assertStatusOk);
}

export const enum EditAction {SET_VOTER = "SET_VOTER", SET_OBSERVER = "SET_OBSERVER", KICK = "KICK"}

export async function editMember(roomName: string, memberUsername: string, action: EditAction) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}/members/${encodeURIComponent(memberUsername)}`, location.href);
	url.searchParams.set("action", action);
	return fetch(url, {
		method: "PATCH",
	}).then(assertStatusOk);
}


export async function getRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<Room>);
}

export async function createVote(roomName: string, cardName: string) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}/votes`, location.href);
	url.searchParams.set("card-name", cardName);
	return fetch(url, {
		method: "POST",
	}).then(assertStatusOk);
}

export async function clearVotes(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes`, {
		method: "DELETE",
	}).then(assertStatusOk);
}


export async function getSummary(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes/summary`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<VoteSummary>);
}

