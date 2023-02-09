import { FC } from "react";
import { Button } from "react-bootstrap";
import { Room, VoteSummary } from "../../api";
import { useBooleanState } from "../../hooks";
import { AhaExtension } from "./AhaExtension";
import { AhaSubmissionModal } from "./AhaSubmissionModal";

export const AhaSubmitButton: FC<{ room: Room, voteSummary: VoteSummary }> = ({room, voteSummary}) => {
	const [modalVisible, showModal, hideModal] = useBooleanState(false);

	const ideaId = room.topic != null ? AhaExtension.extractIdeaId(room.topic) : null;
	const score = Math.round(voteSummary.average);

	return (<>
			<Button size="sm" onClick={showModal} hidden={ideaId == null}>Save to Aha!</Button>
			{ideaId && modalVisible && // Delay mount until click to ensure modal data loading is not done prematurely
				<AhaSubmissionModal ideaId={ideaId} score={score} show={modalVisible} onHide={hideModal} onSubmit={hideModal}/>}
		</>
	);
};
