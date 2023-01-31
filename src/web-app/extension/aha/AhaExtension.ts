import type { Extension } from "../Extension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import { AhaClient, getAhaConfig } from "./api";

const IDEA_PATTERN = /(\w+-(?:I-)?\d+)/;

export class AhaExtension implements Extension {
	key = "aha";
	SubmitComponent = AhaSubmitButton;

	client: AhaClient | null = null;

	async initialize() {
		this.client = new AhaClient(await getAhaConfig());
	}

	async loadSuggestion(newTopic: string) {
		const ideaId = AhaExtension.extractIdeaId(newTopic);
		if (ideaId == null || this.client == null) {
			return null;
		}
		const idea = await this.client.getIdea(ideaId);
		if (idea == null) {
			return null;
		}
		return `${idea.reference_num}: ${idea.name}`;
	}

	static extractIdeaId(val: string): string | null {
		const matchArray = val.match(IDEA_PATTERN);
		return matchArray?.[1] ?? null;
	}
}
