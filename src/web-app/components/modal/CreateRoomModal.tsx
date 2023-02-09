import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Room, RoomCreationOptions } from "../../api";
import { AppContext } from "../../AppContext";

export const CreateRoomModal: FC<{
	show: boolean;
	existingRooms: ReadonlyArray<Room>;
	onHide: () => void;
	onSubmit: (roomName: string, options: RoomCreationOptions) => void;
}> = ({show, existingRooms, onHide, onSubmit}) => {
	const {cardSets} = useContext(AppContext);

	const [roomName, setRoomName] = useState<string>("");
	const [cardSetName, setCardSetName] = useState<string>("");

	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		e.target.setCustomValidity(existingRooms.some(room => room.name == value) ? "This room name is already in use." : "");
		setRoomName(value);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit(roomName, {cardSetName});

		setRoomName("");
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
						<Form.Control
							type="text"
							required
							maxLength={50}
							title="May not contain the following: ;%\/"
							pattern="^[^;%\\\/]+$" // These characters are blocked by StrictHttpFirewall if inside the path. Block them to make the prevent big scary error messages
							value={roomName}
							onChange={handleNameChange}
						/>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formCreateRoomCardSet">
						<Form.Label>Card Set</Form.Label>
						<Form.Select required value={cardSetName} onChange={(e) => setCardSetName(e.target.value)}>
							<option disabled value=""></option>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">Create</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
