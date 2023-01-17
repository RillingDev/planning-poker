import type { Extension } from "../Extension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import { AhaClient, getAhaConfig } from "./api";

export class AhaExtension implements Extension {
	id = "aha";
	SubmitComponent = AhaSubmitButton;

	client: AhaClient | null = null;

	async initialize(): Promise<void> {
		this.client = new AhaClient(await getAhaConfig());
	}
}
