import { FC, FormEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { CardSet, createRoom, loadCardSets } from "../../api";
import Modal from "react-bootstrap/Modal";

/**
 * @param onSubmit Room object must be reloaded after this is fired to get latest state.
 */
export const CreateRoomModal: FC<{
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
	onError: (e: Error) => void;
}> = ({show, onHide, onError, onSubmit}) => {
	const [cardSets, setCardSets] = useState<CardSet[]>([]);

	const [newRoomName, setNewRoomName] = useState<string>("");
	const [newRoomCardSetName, setNewRoomCardSetName] = useState<string>("");

	useEffect(() => {
		loadCardSets().then(loadedCardSets => setCardSets(loadedCardSets)).catch(onError);
	}, [onError]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createRoom(newRoomName, newRoomCardSetName).then(() => onSubmit()).catch(onError);
	};

	return (
		<Modal show={show} onHide={onHide}>
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Create Room</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3" controlId="formCreateRoomName">
						<Form.Label>Room Name</Form.Label>
						<Form.Control required type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}/>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formCreateRoomCardSet">
						<Form.Label>Card Set</Form.Label>
						<Form.Select required value={newRoomCardSetName} onChange={(e) => setNewRoomCardSetName(e.target.value)}>
							<option disabled value=""></option>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">
						Create
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
