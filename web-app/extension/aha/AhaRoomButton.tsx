import { ChangeEvent, FC, FormEvent, useState } from "react";
import { Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import { Room, RoomEditOptions } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useBooleanState, useErrorHandler } from "../../hooks";
import { AhaExtension, ahaExtension } from "./AhaExtension";
import { Idea } from "./api";


const deriveTopic = (idea: Idea): string => {
	return `${idea.reference_num}: ${idea.name}`;
};

const loadIdea = async (ideaId: string) => {
	const client = await ahaExtension.getClient();
	return client.getIdea(ideaId);
};

const AhaIdeaLoadingModal: FC<{
	show: boolean;
	onHide: () => void;
	onSubmit: (changes: RoomEditOptions) => void;
}> = ({show, onHide, onSubmit}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [loadingPending, setLoadingPending] = useState(false);
	const [idea, setIdea] = useState<Idea | null>(null);

	const [input, setInput] = useState("");
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInput(newValue);

		const extractedIdeaId = AhaExtension.extractIdeaId(newValue);
		if (extractedIdeaId == null) {
			e.target.setCustomValidity("Not a valid Aha! idea URL/ID.");
			return;
		} else {
			e.target.setCustomValidity("");
		}

		setLoadingPending(true);
		loadIdea(extractedIdeaId).then(result => {
			setIdea(result);
			e.target.setCustomValidity(result == null ? "Idea not found." : "");
		}).catch(err => {
			handleError(err as Error);
			e.target.setCustomValidity("Could not load idea.");
		}).finally(() => setLoadingPending(false));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		onSubmit({topic: deriveTopic(idea!)});
	};

	const handleHide = (): void => {
		onHide();
		setInput("");
		setIdea(null);
	};

	return (<Modal show={show} onHide={handleHide}>
		<Form onSubmit={handleSubmit}>
			<Modal.Header closeButton>
				<Modal.Title>Load from Aha!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorPanel error={error} onClose={resetError}></ErrorPanel>
				<p>Please enter an Aha! Idea ID or URL to load its details into the application.</p>
				<Form.Group className="mb-3" controlId="formAhaUrl">
					<Form.Label>Aha! URL/ID</Form.Label>
					<Form.Control type="search" required onChange={handleChange} value={input}/>
				</Form.Group>
				<Spinner
					hidden={!loadingPending}
					as="span"
					animation="border"
					size="sm"
					role="status"
					aria-hidden="true"><span className="visually-hidden">Loading Idea</span></Spinner>
				<Card hidden={idea == null}>
					<Card.Header>Preview</Card.Header>
					<Card.Body>
						{idea != null ? deriveTopic(idea) : ""}
					</Card.Body>
				</Card>
			</Modal.Body>
			<Modal.Footer>
				<Button type="submit" variant="primary">Import Idea</Button>
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
			<Button size="sm" onClick={showModal}>Load from Aha!</Button>
			<AhaIdeaLoadingModal show={modalVisible} onHide={hideModal} onSubmit={handleSubmit}/>
		</>
	);
};
