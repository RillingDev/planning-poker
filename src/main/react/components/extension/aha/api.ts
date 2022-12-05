import { assertStatusOk, MEDIA_TYPE_JSON } from "../../../api";

export async function getScoreFactNames() {
	return fetch("/api/extensions/aha/score-facts", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<string[]>);
}

export async function putIdeaScore(roomName: string, scoreFactName: string, value: number) {
	const url = new URL("/api/extensions/aha/score/", location.href);
	url.searchParams.set("room-name", roomName);
	url.searchParams.set("score-fact-name", scoreFactName);
	url.searchParams.set("score-value", String(value));
	return fetch(url, {
		method: "POST"
	}).then(assertStatusOk);
}