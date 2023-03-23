import { FC, FormEvent, useEffect, useState } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { editExtensionRoomConfig, getExtensionRoomConfig } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useBooleanState, useErrorHandler } from "../../hooks";
import { Room, VoteSummary } from "../../model";
import { ahaExtension, AhaExtension } from "./AhaExtension";
import { AhaRoomConfig, Idea } from "./api";
import { loadScoreFactNames } from "./utils";

type LoadedIdea = Idea<"name" | "reference_num">;

const AhaSubmissionModal: FC<{
	roomName: string,
	ideaId: string,
	score: number
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
}> = ({roomName, ideaId, score, show, onHide, onSubmit}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [idea, setIdea] = useState<LoadedIdea | null>(null);
	const [ideaLoading, setIdeaLoading] = useState(false);

	useEffect(() => {
		setIdea(null);
		setIdeaLoading(true);
		ahaExtension.getClient().then(c => c.getIdea(ideaId, ["name", "reference_num"])).then(async (result) => {
			if (result == null) {
				handleError(new Error(`Could not find idea '${ideaId}'.`));
				return;
			}
			setIdea(result.idea);

			const loadedScoreFactNames = await loadScoreFactNames(result.idea.product_id);
			setScoreFactNames(loadedScoreFactNames);

			const ahaRoomConfig = await getExtensionRoomConfig<AhaRoomConfig>(roomName, ahaExtension.key);
			if (ahaRoomConfig.scoreFactName != null) {
				if (loadedScoreFactNames.includes(ahaRoomConfig.scoreFactName)) {
					setScoreFactName(ahaRoomConfig.scoreFactName);
				} else {
					console.warn(`Received outdated score fact name '${ahaRoomConfig.scoreFactName}', ignoring it.`);
				}
			}
		}).catch(handleError).finally(() => setIdeaLoading(false));
	}, [ideaId, roomName, handleError]);


	const [scoreFactNames, setScoreFactNames] = useState<ReadonlyArray<string>>([]);

	const [scoreFactName, setScoreFactName] = useState("");

	const [scoreSubmissionPending, setScoreSubmissionPending] = useState(false);
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setScoreSubmissionPending(true);

		ahaExtension.getClient()
			.then(c => c.putIdeaScore(ideaId, scoreFactName, score))
			.then(onSubmit)
			.catch(handleError)
			.finally(() => setScoreSubmissionPending(false));

		// Is ok to be done in parallel
		editExtensionRoomConfig<AhaRoomConfig>(roomName, ahaExtension.key, {scoreFactName}).catch(handleError);
	};

	const handleExit = (): void => {
		resetError();
		setIdea(null);
		setScoreFactNames([]);
	};

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
							{scoreFactNames.map(factName => <option key={factName} value={factName}>{factName}</option>)}
						</Form.Select>
					</Form.Group>
				</>}
			</Modal.Body>
			<Modal.Footer>
				<button type="submit" className="btn btn-primary" disabled={ideaLoading || scoreSubmissionPending || error != null}>
					<Spinner
						hidden={!scoreSubmissionPending}
						as="span"
						animation="border"
						size="sm"
						role="status"
						aria-hidden="true"><span className="visually-hidden">Submitting Idea Score</span></Spinner> Submit
				</button>
			</Modal.Footer>
		</Form>
	</Modal>);
};


export const AhaSubmitButton: FC<{ room: Room, voteSummary: VoteSummary }> = ({room, voteSummary}) => {
	const [modalVisible, showModal, hideModal] = useBooleanState(false);

	const ideaId = room.topic != null ? AhaExtension.extractIdeaId(room.topic) : null;
	const score = Math.round(voteSummary.average);

	return (<>
			<button type="button" className="btn btn-primary btn-sm" onClick={showModal} hidden={ideaId == null}>
				Save to Aha!
			</button>
			{ideaId && modalVisible && // Delay mount until click to ensure modal data loading is not done prematurely
				<AhaSubmissionModal roomName={room.name} ideaId={ideaId} score={score} show={modalVisible} onHide={hideModal} onSubmit={hideModal}/>}
		</>
	);
};
