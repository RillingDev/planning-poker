import { FC, FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { CardSet, editRoom, loadCardSets, Room } from "../../api";
import Modal from "react-bootstrap/Modal";


/**
 * @param onSubmit Room object must be reloaded after this is fired to get latest state.
 */
export const EditRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
	onError: (e: Error) => void;
}> = ({room, show, onHide, onError, onSubmit}) => {
	const [cardSets, setCardSets] = useState<CardSet[]>([]);
	const handleShow = () => {
		loadCardSets().then(loadedCardSets => setCardSets(loadedCardSets)).catch(onError);
	};

	const [newCardSetName, setNewCardSetName] = useState<string>("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		editRoom(room.name, newCardSetName).then(() => onSubmit()).catch(onError);
	};

	return (
		<Modal show={show} onHide={onHide} onShow={() => handleShow()}>
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Room &apos;{room.name}&apos;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3" controlId="formCreateRoomCardSet">
						<Form.Label>Card Set</Form.Label>
						<Form.Select required value={newCardSetName} onChange={(e) => setNewCardSetName(e.target.value)}>
							<option disabled value=""></option>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">
						Update
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
