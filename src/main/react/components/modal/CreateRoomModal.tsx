import { FC, FormEvent, useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { CardSet } from "../../api";
import { AppContext } from "../../AppContext";

export const CreateRoomModal: FC<{
	show: boolean;
	onHide: () => void;
	onSubmit: (roomName: string, roomTopic: string, cardSet: CardSet) => void;
}> = ({show, onHide, onSubmit}) => {
	const {cardSets} = useContext(AppContext);

	const [roomName, setRoomName] = useState<string>("");
	const [roomTopic, setRoomTopic] = useState<string>("");
	const [cardSetName, setCardSetName] = useState<string>("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit(roomName, roomTopic, cardSets.find(cardSet => cardSet.name == cardSetName)!);
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
						<Form.Control required type="text" maxLength={50} value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formCreateRoomCardSet">
						<Form.Label>Card Set</Form.Label>
						<Form.Select required value={cardSetName} onChange={(e) => setCardSetName(e.target.value)}>
							<option disabled value=""></option>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formCreateRoomTopic">
						<Form.Label>Topic</Form.Label>
						<Form.Control as="textarea" value={roomTopic} onChange={(e) => setRoomTopic(e.target.value)}/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">Create</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
