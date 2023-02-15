import { FC, FormEvent, useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Room, VoteSummary } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useBooleanState, useErrorHandler } from "../../hooks";
import { ahaExtension, AhaExtension } from "./AhaExtension";
import { Idea } from "./api";


const AhaSubmissionModal: FC<{
	ideaId: string,
	score: number
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
}> = ({ideaId, score, show, onHide, onSubmit}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [idea, setIdea] = useState<Idea | null>(null);
	const [ideaLoading, setIdeaLoading] = useState(false);
	useEffect(() => {
		setIdeaLoading(true);
		ahaExtension.getIdea(ideaId).then(idea => {
			if (idea == null) {
				handleError(new Error(`Could not find idea '${ideaId}'.`));
				return;
			}
			setIdea(idea);
		}).catch(handleError).finally(() => setIdeaLoading(false));
	}, [ideaId, handleError]);

	const [scoreFactName, setScoreFactName] = useState("");

	const [scoreSubmissionPending, setScoreSubmissionPending] = useState(false);
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setScoreSubmissionPending(true);
		ahaExtension.putIdeaScore(ideaId, scoreFactName, score).then(onSubmit).catch(handleError).finally(() => setScoreSubmissionPending(false));
	};

	const handleExit = (): void => {
		resetError();
		setIdea(null);
	};

	// TODO: show previous score
	return (<Modal show={show} onExit={handleExit} onHide={onHide}>
		<Form onSubmit={handleSubmit}>
			<Modal.Header closeButton>
				<Modal.Title>Save to Aha!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorPanel error={error} onClose={resetError} dismissible={false}></ErrorPanel>
				<Spinner
					hidden={!ideaLoading}
					as="span"
					animation="border"
					size="sm"
					role="status"
					aria-hidden="true"><span className="visually-hidden">Loading Idea</span></Spinner>
				{idea != null && <>
					<p>You are about to save the score <strong>{score}</strong> to Aha! for the
						idea &quot;<strong>{ideaId}: {idea.name}</strong>&quot;.</p>

					<Form.Group className="mb-3" controlId="formAhaScoreFact">
						<Form.Label>Score Fact Name</Form.Label>
						<Form.Select required value={scoreFactName} onChange={(e) => setScoreFactName(e.target.value)}>
							<option disabled value=""></option>
							{idea.score_facts.map(fact => <option key={fact.name}>{fact.name}</option>)}
						</Form.Select>
					</Form.Group>
				</>}
			</Modal.Body>
			<Modal.Footer>
				<Button type="submit" variant="primary" disabled={ideaLoading || scoreSubmissionPending || error != null}>
					<Spinner
						hidden={!scoreSubmissionPending}
						as="span"
						animation="border"
						size="sm"
						role="status"
						aria-hidden="true"><span className="visually-hidden">Submitting Idea Score</span></Spinner> Submit</Button>
			</Modal.Footer>
		</Form>
	</Modal>);
};


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
