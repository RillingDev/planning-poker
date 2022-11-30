import { FC, FormEvent, useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { CardSet, Room } from "../../api";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../AppContext";


/**
 * @param onSubmit Room object must be reloaded after this is fired to get latest state.
 */
export const EditRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: (cardSet: CardSet) => void;
}> = ({room, show, onHide, onSubmit}) => {
	const {cardSets} = useContext(AppContext);

	const [newCardSetName, setNewCardSetName] = useState<string>(room.cardSet.name);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit(cardSets.find(cardSet => cardSet.name == newCardSetName)!);
	};

	return (
		<Modal show={show} onHide={onHide}>
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Room &apos;{room.name}&apos;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3" controlId="formEditRoomCardSet">
						<Form.Label>Card Set</Form.Label>
						<Form.Select required value={newCardSetName} onChange={(e) => setNewCardSetName(e.target.value)}>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary"> Update </Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
