export interface Room {
	readonly name: string;
	readonly cardSetName: string;
}

export interface Card {
	readonly name: string;
	readonly value: number;
}

export interface CardSet {
	readonly name: string;
	readonly cards: ReadonlyArray<Card>;
}

function assertStatusOk(res: Response): Response {
	if (res.status >= 200 && res.status <= 299) {
		return res;
	}
	throw new Error(
		`Unexpected status code: ${res.status} - ${res.statusText}.`
	);
}

const MEDIA_TYPE_JSON = "application/json";

export async function loadRooms() {
	return fetch("/api/rooms", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<Room[]>);
}

export async function createRoom(name: string, cardSetName: string) {
	return fetch("/api/rooms", {
		method: "POST",
		headers: {"Content-Type": MEDIA_TYPE_JSON},
		body: JSON.stringify({name, cardSetName})
	}).then(assertStatusOk);
}

export async function loadCardSets() {
	return fetch("/api/card-sets", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<CardSet[]>);
}
