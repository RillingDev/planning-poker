import { getExtensionConfig } from "../../api";
import type { Extension } from "../Extension";
import { AhaRoomButton } from "./AhaRoomButton";
import { AhaSubmitButton } from "./AhaSubmitButton";
import { AhaClient, AhaConfig, Idea } from "./api";

const IDEA_PATTERN = /(\w+-(?:I-)?\d+)/;

export class AhaExtension implements Extension {
	key = "aha";
	label = "Aha!";

	RoomComponent = AhaRoomButton;
	SubmitComponent = AhaSubmitButton;

	#client: AhaClient | null = null;

	async #getClient(): Promise<AhaClient> {
		if (this.#client == null) {
			this.#client = new AhaClient(await getExtensionConfig<AhaConfig>(this.key));
		}
		return this.#client;
	}

	async getIdea(ideaId: string): Promise<Idea | null> {
		return this.#getClient().then(c => c.getIdea(ideaId));
	}

	async putIdeaScore(ideaId: string, scoreFactName: string, score: number): Promise<void> {
		return this.#getClient().then(c => c.putIdeaScore(ideaId, scoreFactName, score));
	}

	static extractIdeaId(val: string): string | null {
		const matchArray = val.match(IDEA_PATTERN);
		return matchArray?.[1] ?? null;
	}
}

export const ahaExtension = new AhaExtension();
