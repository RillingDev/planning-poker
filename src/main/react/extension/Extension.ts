import { FC } from "react";
import { ExtensionKey, Room, VoteSummary } from "../api";

export type SubmitComponent = FC<{ self: Extension, room: Room, voteSummary: VoteSummary }>;

export interface Extension {
	readonly key: ExtensionKey;
	readonly SubmitComponent: SubmitComponent;

	initialize(): Promise<void>;

	loadSuggestion(newTopic: string): Promise<string | null>;
}