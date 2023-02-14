import { ChangeEvent, FC, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Room, RoomEditOptions } from "../../api";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useBooleanState, useErrorHandler } from "../../hooks";
import { AhaExtension, ahaExtension } from "./AhaExtension";
import { Idea } from "./api";


const deriveTopic = (idea: Idea): string => {
	return `${idea.reference_num}: ${idea.name}`;
};

const AhaIdeaLoadingModal: FC<{
	show: boolean;
	onHide: () => void;
	onSubmit: (changes: RoomEditOptions) => void;
}> = ({show, onHide, onSubmit}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [loadingPending, setLoadingPending] = useState(false);

	const loadIdea = async (ideaId: string) => {
		const client = await ahaExtension.getClient();
		const idea = await client.getIdea(ideaId);
		if (idea == null) {
			handleError(new Error("Idea not found."));
			return;
		}
		onSubmit({topic: deriveTopic(idea)});
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const extractIdeaId = AhaExtension.extractIdeaId(e.target.value);
		if (extractIdeaId == null) {
			e.target.setCustomValidity("Not a valid Aha! idea URL/ID.");
			e.target.reportValidity();
			return;
		} else {
			e.target.setCustomValidity("");
		}

		setLoadingPending(true);
		loadIdea(extractIdeaId).catch(handleError).finally(() => setLoadingPending(false));
	};

	const handleHide = (): void => {
		onHide();
		resetError();
	};

	return (<Modal show={show} onHide={handleHide}>
		<Form>
			<Modal.Header closeButton>
				<Modal.Title>Load from Aha!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorPanel error={error} onClose={resetError}></ErrorPanel>
				<p>Please paste an Aha! Idea ID or URL to load its details into the application.</p>
				<Form.Group className="mb-3" controlId="formAhaUrl">
					<Form.Label>Aha! URL/ID</Form.Label>
					<Form.Control type="search" required onChange={handleChange}/>
				</Form.Group>
				<Spinner
					hidden={!loadingPending}
					as="span"
					animation="border"
					size="sm"
					role="status"
					aria-hidden="true"><span className="visually-hidden">Loading Idea</span></Spinner>
			</Modal.Body>
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
