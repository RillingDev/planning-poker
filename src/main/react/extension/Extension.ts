import { FC } from "react";
import { Room, VoteSummary } from "../api";

export type SubmitComponent = FC<{ self: Extension, room: Room, voteSummary: VoteSummary }>;

export interface Extension {
	readonly key: string;
	readonly SubmitComponent: SubmitComponent;

	initialize(): Promise<void>;

	loadSuggestion(newTopic: string): Promise<string | null>;
}