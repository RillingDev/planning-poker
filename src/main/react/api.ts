export const enum Role {
	USER = 1,
	OBSERVER = 2,
}

export interface User {
	readonly username: string,
}

interface RoomMember {
	readonly username: string,
	readonly role: Role
}

export interface Room {
	readonly name: string;
	readonly cardSetName: string;
	readonly members: ReadonlyArray<RoomMember>;
}

export interface Card {
	readonly name: string;
	readonly value: number;
}

export interface CardSet {
	readonly name: string;
	readonly cards: ReadonlyArray<Card>;
}

async function assertStatusOk(res: Response): Promise<Response> {
	if (res.status >= 200 && res.status <= 299) {
		return res;
	}
	throw new Error(
		`Unexpected status code: ${res.status}:\n${await res.text()}.`,
	);
}

const MEDIA_TYPE_JSON = "application/json";

export async function loadIdentity() {
	return fetch("/api/identity", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<User>);
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
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/session`, {
		method: "POST",
	}).then(assertStatusOk);
}

export async function leaveRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/session`, {
		method: "DELETE",
	}).then(assertStatusOk);
}


export async function loadCardSets() {
	return fetch("/api/card-sets", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON},
	}).then(assertStatusOk).then(res => res.json() as Promise<CardSet[]>);
}
