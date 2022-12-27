import { FC, FormEvent, useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Room, VoteSummary } from "../../../api";
import { useBooleanState, useErrorHandler } from "../../../hooks";
import { ErrorPanel } from "../../ErrorPanel";
import { getScoreFactNames, putIdeaScore } from "./api";

export const AhaSubmitButton: FC<{ room: Room, voteSummary: VoteSummary }> = ({room, voteSummary}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [modalVisible, showModal, hideModal] = useBooleanState(false);

	const [scoreFactName, setScoreFactName] = useState("");

	const [scoreFactNames, setScoreFactNames] = useState<string[]>([]);
	useEffect(() => {
		getScoreFactNames().then(loaded => setScoreFactNames(loaded)).catch(handleError);
	}, [handleError]);


	const [ajaxInProgress, setAjaxInProgress] = useState(false);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setAjaxInProgress(true);
		putIdeaScore(room.name, scoreFactName, score).then(hideModal).catch(handleError).finally(() => setAjaxInProgress(false));
	};

	const ideaId = room.topic;
	const score = voteSummary.average;

	return (<>
			<Button size="sm" onClick={showModal} hidden={ideaId == null}>Save to Aha!</Button>
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
							<Form.Label>Score Fact Name</Form.Label>
							<Form.Select required value={scoreFactName} onChange={(e) => setScoreFactName(e.target.value)}>
								<option disabled value=""></option>
								{scoreFactNames.map(factName => <option key={factName}>{factName}</option>)}
							</Form.Select>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button type="submit" variant="primary">
							<Spinner
								hidden={!ajaxInProgress}
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
