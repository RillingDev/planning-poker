import { isStatusOk, MEDIA_TYPE_JSON } from "../../apiUtils";

const ACCESS_TOKEN_REGEX = /#access_token=(\w+)/;

export interface AhaConfig {
	readonly accountDomain: string;
	readonly clientId: string;
	readonly redirectUri: string;
}

export async function getAhaConfig() {
	return fetch("/api/extensions/aha/config", {
		method: "GET",
		headers: {"Accept": MEDIA_TYPE_JSON}
	}).then(assertStatusOk).then(res => res.json() as Promise<AhaConfig>);
}

interface ScoreFact {
	readonly name: string,
	readonly value: number
}

export interface Idea {
	name: string,
	score_facts: ScoreFact[]
	reference_num: string
}

export class AhaClient {
	readonly #clientId: string;
	readonly #redirectUri: URL;
	readonly #apiUrl: URL;
	readonly #authUrl: URL;

	#accessToken: string | null;

	constructor(config: AhaConfig) {
		this.#clientId = config.clientId;
		this.#redirectUri = new URL(config.redirectUri);

		const baseUrl = new URL("https://" + config.accountDomain + ".aha.io/");

		this.#apiUrl = new URL("api/v1/", baseUrl);

		this.#authUrl = new URL("oauth/authorize", baseUrl);
		this.#authUrl.searchParams.set("response_type", "token");
		this.#authUrl.searchParams.set("client_id", this.#clientId);
		this.#authUrl.searchParams.set("redirect_uri", this.#redirectUri.toString());

		this.#accessToken = null;
	}

	async #authenticate(): Promise<void> {
		if (this.#accessToken == null) {
			this.#accessToken = await this.#requestAuthorization();
			console.log("Authenticated client.");
		}
	}

	async #requestAuthorization(): Promise<string> {
		return new Promise((resolve, reject) => {
			const newWindow = window.open(this.#authUrl, "aha-auth-window", "width=940, height=650");
			const completionTimer = setInterval(() => {
				if (newWindow == null) {
					clearInterval(completionTimer);

					reject(new Error("Could not open window"));
					return;
				}

				if (newWindow.location.host == this.#redirectUri.host) {
					newWindow.close();
					clearInterval(completionTimer);

					const exec = ACCESS_TOKEN_REGEX.exec(newWindow.location.hash);
					if (exec == null) {
						reject(new TypeError(`Unexpected response: ${newWindow.location.href}`));
						return;
					}
					const accessToken = exec[1];
					resolve(accessToken);
				}
			}, 500);
		});
	}

	#getBaseHeaders() {
		return {"Authorization": `Bearer ${this.#accessToken!}`};
	}

	async getIdea(ideaId: string): Promise<Idea> {
		await this.#authenticate();

		const url = new URL("ideas/" + encodeURIComponent(ideaId) + "/", this.#apiUrl);
		return fetch(url, {
			method: "GET",
			headers: {
				...this.#getBaseHeaders(),
				"Accept": MEDIA_TYPE_JSON
			}
		}).then(assertStatusOk).then(res => res.json() as Promise<{
			idea: Idea;
		}>).then(res => res.idea);
	}

	async putIdeaScore(ideaId: string, scoreFactName: string, value: number): Promise<void> {
		await this.#authenticate();

		const url = new URL("ideas/" + encodeURIComponent(ideaId) + "/", this.#apiUrl);
		const body: Partial<Idea> = {
			score_facts: [{name: scoreFactName, value: value}]
		};
		await fetch(url, {
			method: "PUT",
			body: JSON.stringify({
				idea: body
			}),
			headers: {
				...this.#getBaseHeaders(),
				"Content-Type": MEDIA_TYPE_JSON
			}
		}).then(assertStatusOk);
	}
}

async function assertStatusOk(res: Response): Promise<Response> {
	if (isStatusOk(res)) {
		return res;
	}
	const body = await res.text();
	throw new Error(
		`Unexpected status code '${res.status}':\n\n${body}.`,
	);
}
