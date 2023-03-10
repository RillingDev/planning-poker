import { ChangeEvent, FC, FormEvent, useState } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { Room, RoomEditOptions } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useBooleanState, useErrorHandler } from "../../hooks";
import { ahaExtension, AhaExtension } from "./AhaExtension";
import { Idea } from "./api";


type LoadedIdea = Idea<"name" | "reference_num">;

const deriveTopic = (idea: LoadedIdea): string => {
	return `${idea.reference_num}: ${idea.name}`;
};

const AhaIdeaLoadingModal: FC<{
	show: boolean;
	onHide: () => void;
	onSubmit: (changes: RoomEditOptions) => void;
}> = ({show, onHide, onSubmit}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [ideaLoading, setIdeaLoading] = useState(false);
	const [idea, setIdea] = useState<LoadedIdea | null>(null);

	const [input, setInput] = useState("");
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInput(newValue);

		const extractedIdeaId = AhaExtension.extractIdeaId(newValue);
		if (extractedIdeaId == null) {
			e.target.setCustomValidity("Not a valid Aha! idea URL/ID.");
			return;
		}

		setIdea(null);
		setIdeaLoading(true);
		ahaExtension.getClient()
			.then(c => c.getIdea(extractedIdeaId, ["name", "reference_num"]))
			.then(result => {
				setIdea(result?.idea ?? null);
				e.target.setCustomValidity(result == null ? "Idea not found." : "");
			})
			.catch(handleError)
			.finally(() => setIdeaLoading(false));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		onSubmit({topic: deriveTopic(idea!)});
	};

	const handleExit = (): void => {
		resetError();
		setInput("");
		setIdea(null);
	};

	return (<Modal show={show} onExit={handleExit} onHide={onHide}>
		<Form onSubmit={handleSubmit}>
			<Modal.Header closeButton>
				<Modal.Title>Load from Aha!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorPanel error={error} onClose={resetError} dismissible={false}></ErrorPanel>
				<p>Please enter an Aha! Idea ID or URL to load its details into the application.</p>
				<Form.Group className="mb-3" controlId="formAhaUrl">
					<Form.Label>Aha! URL/ID</Form.Label>
					<Form.Control type="search" required onChange={handleChange} value={input}/>
				</Form.Group>
				<Spinner
					hidden={!ideaLoading}
					as="span"
					animation="border"
					size="sm"
					role="status"
					aria-hidden="true"><span className="visually-hidden">Loading Idea</span></Spinner>
				<div className="card" hidden={idea == null}>
					<div className="card-header">
						Preview
					</div>
					<div className="card-body">
						{idea != null ? deriveTopic(idea) : ""}
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<button type="submit" className="btn btn-primary" disabled={ideaLoading || error != null}>Import Idea</button>
			</Modal.Footer>
		</Form>
	</Modal>);
};

export const AhaRoomButton: FC<{ room: Room, onChange: (changes: RoomEditOptions) => void }> = ({onChange}) => {
	const [modalVisible, showModal, hideModal] = useBooleanState(false);

	const handleSubmit = (changes: RoomEditOptions) => {
		onChange(changes);
		hideModal();
	};

	return (<>
			<button type="button" className="btn btn-primary btn-sm" onClick={showModal}>Load from Aha!</button>
			<AhaIdeaLoadingModal show={modalVisible} onHide={hideModal} onSubmit={handleSubmit}/>
		</>
	);
};
