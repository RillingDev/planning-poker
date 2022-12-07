import type { Extension } from "../Extension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import { AhaClient, getAhaConfig } from "./api";
import { extractIdeaId } from "./utils";

export class AhaExtension implements Extension {
	key = "aha";
	label = "Aha!";

	SubmitComponent = AhaSubmitButton;

	client: AhaClient | null = null;

	async initialize() {
		this.client = new AhaClient(await getAhaConfig());
	}

	async loadSuggestion(newTopic: string) {
		const ideaId = extractIdeaId(newTopic);
		if (ideaId == null || this.client == null) {
			return null;
		}
		const idea = await this.client.getIdea(ideaId);
		if (idea == null) {
			return null;
		}
		return `${idea.reference_num}: ${idea.name}`;
	}
}
