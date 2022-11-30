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
	readonly cardSet: CardSet;
	readonly members: ReadonlyArray<RoomMember>;
	readonly votingComplete: boolean;
}

export interface Card {
	readonly name: string;
	readonly value: number;
}

export interface CardSet {
	readonly name: string;
	readonly cards: ReadonlyArray<Card>;
}

export interface VoteSummary {
	readonly average: number;
	readonly variance: number;
	readonly nearestCard: Card;
	readonly highestVote: Card;
	readonly highestVoters: ReadonlyArray<RoomMember>;
	readonly lowestVote: Card;
	readonly lowestVoters: ReadonlyArray<RoomMember>;
}

async function assertStatusOk(res: Response): Promise<Response> {
	if (res.status >= 200 && res.status <= 299) {
		return res;
	}
	const body = await res.text();
	throw new Error(
		`Unexpected status code '${res.status}':\n\n${body}.`,
	);
}

const MEDIA_TYPE_JSON = "application/json";

export async function loadIdentity() {
	return fetch("/api/identity", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<User>);
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

export async function createRoom(roomName: string, cardSetName: string) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}`, location.href);
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

export async function editRoom(roomName: string, cardSetName: string) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}`, location.href);
	url.searchParams.set("card-set-name", cardSetName);
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
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes/summary`, {
		method: "DELETE",
	}).then(assertStatusOk);
}


export async function getSummary(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes/summary`, {
		method: "GET",
	}).then(assertStatusOk).then(res => res.json() as Promise<VoteSummary>);
}

