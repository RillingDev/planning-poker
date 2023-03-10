import { isStatusOk, MEDIA_TYPE_JSON } from "../../apiUtils";

const ACCESS_TOKEN_REGEX = /#access_token=(\w+)/;

const IDEA_FIELDS = "name,reference_num,score_facts";

export interface AhaConfig {
	readonly accountDomain: string;
	readonly clientId: string;
	readonly redirectUri: string;
}

interface ScoreFact {
	readonly name: string;
	readonly value: number;
}

interface FullIdea {
	readonly id: string;
	readonly name: string;
	readonly reference_num: string;
	readonly product_id: string;
	/**
	 * Empty if Aha! idea score was never updated.
	 */
	readonly score_facts: ScoreFact[];
}


// Aha! Responses can be filtered to only contain some fields.
type IdeaInitialKey = "id" | "product_id";
type IdeaFilterKey = keyof Omit<FullIdea, IdeaInitialKey>;
export type Idea<T extends IdeaFilterKey = "name" | "reference_num" | "score_facts"> = Pick<FullIdea, T> & Pick<FullIdea, IdeaInitialKey>


// https://www.aha.io/api#pagination
type Paginated<T> = T & {
	readonly pagination: {
		readonly total_records: number;
		readonly total_pages: number;
		readonly current_page: number;
	}
}

export interface IdeaResponse {
	readonly idea: Idea;
}

export type IdeasResponse = Paginated<{
	readonly ideas: ReadonlyArray<Idea>;
}>;

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
			console.debug("No access token exists, requesting authorization.");
			this.#accessToken = await this.#requestAuthorization();
		} else {
			console.debug("Access token exists, skipping authorization.");
		}
	}

	// https://www.aha.io/api/oauth2
	async #requestAuthorization(): Promise<string> {
		return new Promise((resolve, reject) => {
			console.debug("Opening Aha! Auth window.");
			const newWindow = window.open(this.#authUrl, "aha-auth-window", "width=940, height=650");
			const completionTimer = setInterval(() => {
				console.debug("Checking Aha! Auth window.");

				if (newWindow == null) {
					clearInterval(completionTimer);
					reject(new Error("Could not open window."));
					return;
				}

				let windowUrl: string;
				try {
					windowUrl = newWindow.location.host;
				} catch (e) {
					// Access denied, because not the same origin (yet).
					return;
				}

				if (windowUrl != this.#redirectUri.host) {
					console.debug("Not redirected yet, sleeping.");
				} else {
					const exec = ACCESS_TOKEN_REGEX.exec(newWindow.location.hash);
					if (exec == null) {
						reject(new TypeError(`Unexpected response URI: ${newWindow.location.href}`));
						return;
					}
					const accessToken = exec[1];
					newWindow.close();
					clearInterval(completionTimer);
					console.log("Authenticated client.");
					resolve(accessToken);
				}
			}, 500);
		});
	}

	#getBaseHeaders() {
		return {
			"Authorization": `Bearer ${this.#accessToken!}`,
			// According to the docs, user-agent should be set here, but the CORS configuration of the Aha! REST API forbids this.
		};
	}

	// https://www.aha.io/api/resources/ideas/list_ideas_for_a_product
	async getIdeasForProduct(productId: string, page: number, perPage: number): Promise<IdeasResponse> {
		await this.#authenticate();

		const url = new URL(`products/${encodeURIComponent(productId)}/ideas`, this.#apiUrl);
		url.searchParams.set("fields", IDEA_FIELDS);
		url.searchParams.set("page", String(page));
		url.searchParams.set("per_page", String(perPage));

		const response = await fetch(url, {
			method: "GET",
			headers: {
				...this.#getBaseHeaders(),
				"Accept": MEDIA_TYPE_JSON
			}
		});

		await assertStatusOk(response);

		const body = await response.json() as IdeasResponse;
		console.log("Retrieved ideas.", body);
		return body;
	}


	// https://www.aha.io/api/resources/ideas/get_a_specific_idea
	async getIdea(ideaId: string): Promise<IdeaResponse | null> {
		await this.#authenticate();

		const url = new URL(`ideas/${encodeURIComponent(ideaId)}`, this.#apiUrl);
		url.searchParams.set("fields", IDEA_FIELDS);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				...this.#getBaseHeaders(),
				"Accept": MEDIA_TYPE_JSON
			}
		});

		if (response.status == 404) {
			return null;
		}
		await assertStatusOk(response);

		const body = await response.json() as IdeaResponse;
		console.log("Retrieved idea.", body);
		return body;
	}

	// https://www.aha.io/api/resources/ideas/update_an_idea
	async putIdeaScore(ideaId: string, scoreFactName: string, value: number): Promise<void> {
		await this.#authenticate();

		const url = new URL(`ideas/${encodeURIComponent(ideaId)}`, this.#apiUrl);

		const ideaPayload: Partial<FullIdea> = {
			score_facts: [{name: scoreFactName, value: value}]
		};
		const body = {
			idea: ideaPayload
		};

		const response = await fetch(url, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				...this.#getBaseHeaders(),
				"Content-Type": MEDIA_TYPE_JSON
			}
		});

		await assertStatusOk(response);

		console.log("Submitted idea score.", body);
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
