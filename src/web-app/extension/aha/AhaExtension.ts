import type { Extension } from "../Extension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import { AhaClient, getAhaConfig } from "./api";

const IDEA_PATTERN = /(\w+-(?:I-)?\d+)/;

export class AhaExtension implements Extension {
	key = "aha";
	SubmitComponent = AhaSubmitButton;

	#client: AhaClient | null = null;

	async loadSuggestion(newTopic: string) {
		const ideaId = AhaExtension.extractIdeaId(newTopic);
		if (ideaId == null) {
			return null;
		}

		const idea = await this.getClient().then(client => client.getIdea(ideaId));
		if (idea == null) {
			return null;
		}
		return `${idea.reference_num}: ${idea.name}`;
	}

	async getClient(): Promise<AhaClient> {
		if (this.#client == null) {
			this.#client = new AhaClient(await getAhaConfig());
		}
		return this.#client;
	}

	static extractIdeaId(val: string): string | null {
		const matchArray = val.match(IDEA_PATTERN);
		return matchArray?.[1] ?? null;
	}
}

export const ahaExtension = new AhaExtension();
