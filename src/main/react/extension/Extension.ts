import { FC } from "react";
import { Room, VoteSummary } from "../api";

export type SubmitComponent = FC<{ room: Room, voteSummary: VoteSummary }>;

export interface Extension {
	readonly id: string;
	readonly SubmitComponent: SubmitComponent;
}