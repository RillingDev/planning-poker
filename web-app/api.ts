import { isStatusOk, MEDIA_TYPE_JSON } from "./apiUtils";
import { CardSet, EditAction, ExtensionKey, Room, RoomCreationOptions, RoomEditOptions, SummaryResult, User } from "./model";


async function assertStatusOk(res: Response): Promise<Response> {
	if (isStatusOk(res)) {
		return res;
	}

	if (res.status == 403) {
		throw new Error("Missing permissions. This may be because you were kicked from the room. Please go back to the room list.");
	}
	if (res.status == 404) {
		throw new Error("Not found. This may be because this room was deleted in the meantime. Please go back to the room list.");
	}

	const body = await res.text();
	throw new Error(
		`Unexpected status code '${res.status}':
		${body}.`,
	);
}

export async function getIdentity() {
	return fetch("/api/identity", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<User>);
}


export async function getExtensions() {
	return fetch("/api/extensions", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<ReadonlyArray<ExtensionKey>>);
}

export async function getExtensionConfig<T>(extensionKey: ExtensionKey) {
	return fetch(`/api/extensions/${extensionKey}`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<T>);
}


export async function getExtensionRoomConfig<T>(roomName: string, extensionKey: ExtensionKey) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/extensions/${extensionKey}`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<T>);
}

export async function editExtensionRoomConfig<T>(roomName: string, extensionKey: ExtensionKey, config: Partial<T>) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}/extensions/${extensionKey}`, {
		method: "PATCH",
		headers: {"Content-Type": MEDIA_TYPE_JSON},
		body: JSON.stringify(config)
	}).then(assertStatusOk);
}


export async function getCardSets() {
	return fetch("/api/card-sets", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON},
	}).then(assertStatusOk).then(res => res.json() as Promise<CardSet[]>);
}


export async function getRooms() {
	return fetch("/api/rooms", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<Room[]>);
}

export async function createRoom(roomName: string, {cardSetName}: RoomCreationOptions) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
		method: "POST",
		headers: {"Content-Type": MEDIA_TYPE_JSON},
		body: JSON.stringify({cardSetName})
	}).then(assertStatusOk);
}


export async function getRoom(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<Room>);
}


export async function deleteRoom(roomName: string) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
		method: "DELETE",
	}).then(assertStatusOk);
}


export async function editRoom(roomName: string, {topic, cardSetName, extensions}: RoomEditOptions) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
		method: "PATCH",
		headers: {"Content-Type": MEDIA_TYPE_JSON},
		// Note: `undefined` values mean the key will not be part of the JSON payload
		body: JSON.stringify({topic, cardSetName, extensions})
	}).then(assertStatusOk);
}


export async function joinRoom(roomName: string) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
		method: "POST",
	}).then(assertStatusOk);
}

export async function leaveRoom(roomName: string) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
		method: "DELETE",
	}).then(assertStatusOk);
}

export async function editMember(roomName: string, memberUsername: string, action: EditAction) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}/members/${encodeURIComponent(memberUsername)}`, location.href);
	url.searchParams.set("action", action);
	await fetch(url, {
		method: "PATCH",
	}).then(assertStatusOk);
}


export async function createVote(roomName: string, cardName: string) {
	const url = new URL(`/api/rooms/${encodeURIComponent(roomName)}/votes`, location.href);
	url.searchParams.set("card-name", cardName);
	await fetch(url, {
		method: "POST",
	}).then(assertStatusOk);
}


export async function clearVotes(roomName: string) {
	await fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes`, {
		method: "DELETE",
	}).then(assertStatusOk);
}


export async function getSummary(roomName: string) {
	return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes/summary`, {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<SummaryResult>);
}

