import { FC } from "react";
import { Button } from "react-bootstrap";
import { Room, VoteSummary } from "../../api";
import { useBooleanState } from "../../hooks";
import { Extension } from "../Extension";
import { AhaExtension } from "./AhaExtension";
import { AhaSubmissionModal } from "./AhaSubmissionModal";

export const AhaSubmitButton: FC<{ self: Extension, room: Room, voteSummary: VoteSummary }> = ({self, room, voteSummary}) => {
	const [modalVisible, showModal, hideModal] = useBooleanState(false);

	const ideaId = room.topic;
	const score = Math.round(voteSummary.average);

	const client = (self as AhaExtension).client!;

	return (<>
			<Button size="sm" onClick={showModal} hidden={ideaId == null}>Save to Aha!</Button>
			{ideaId && modalVisible && // Delay mount until click to ensure modal data loading is not done prematurely
				<AhaSubmissionModal client={client} ideaId={ideaId} score={score} show={modalVisible} onHide={hideModal} onSubmit={hideModal}/>}
		</>
	);
};
