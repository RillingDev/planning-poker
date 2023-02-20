import { FC } from "react";
import { ExtensionKey, Room, RoomEditOptions, VoteSummary } from "../api";

export type RoomComponent = FC<{ room: Room, onChange: (room: RoomEditOptions) => void }>;
export type SubmitComponent = FC<{ room: Room, voteSummary: VoteSummary }>;

export interface Extension {
	readonly key: ExtensionKey;
	readonly label: string;

	readonly RoomComponent: RoomComponent;
	readonly SubmitComponent: SubmitComponent;
}