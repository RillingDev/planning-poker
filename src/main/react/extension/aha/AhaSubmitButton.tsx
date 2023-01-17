import { FC, FormEvent, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Room, VoteSummary } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useAsyncData, useBooleanState, useErrorHandler } from "../../hooks";
import { Extension } from "../Extension";
import { AhaExtension } from "./AhaExtension";

export const AhaSubmitButton: FC<{ self: Extension, room: Room, voteSummary: VoteSummary }> = ({self, room, voteSummary}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [modalVisible, showModalInternal, hideModal] = useBooleanState(false);

	const [scoreFactName, setScoreFactName] = useState("");


	const ideaId = room.topic;
	const score = Math.round(voteSummary.average);

	const ahaClient = (self as AhaExtension).client!;

	const [scoreFactNames, loadScoreFactNames, scoreFactNamesPending] = useAsyncData(() => ahaClient.getIdea(ideaId!).then(idea => idea.score_facts.map(item => item.name)));
	const showModal = () => {
		showModalInternal();
		loadScoreFactNames().catch(handleError);
	};

	const [scoreSubmissionPending, setScoreSubmissionPending] = useState(false);
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setScoreSubmissionPending(true);
		ahaClient.putIdeaScore(ideaId!, scoreFactName, score).then(hideModal).catch(handleError).finally(() => setScoreSubmissionPending(false));
	};

	return (<>
			<Button size="sm" onClick={showModal} hidden={ideaId == null} disabled={ahaClient == null}>Save to Aha!</Button>
			<Modal show={modalVisible} onHide={hideModal}>
				<Form onSubmit={handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>Save to Aha!</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<ErrorPanel error={error} onClose={resetError}></ErrorPanel>
						<p>You are about to save the score <strong>{score}</strong> to Aha! for the
							idea with the ID <strong>{ideaId}</strong>.</p>
						<Form.Group className="mb-3" controlId="formAhaScoreFact">
							<Form.Label>Score Fact Name <Spinner
								hidden={!scoreFactNamesPending}
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
							/></Form.Label>
							<Form.Select required value={scoreFactName} onChange={(e) => setScoreFactName(e.target.value)} disabled={scoreFactNamesPending}>
								<option disabled value=""></option>
								{(scoreFactNames ?? []).map(factName => <option key={factName}>{factName}</option>)}
							</Form.Select>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button type="submit" variant="primary">
							<Spinner
								hidden={!scoreSubmissionPending}
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
							/> Submit</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
};
