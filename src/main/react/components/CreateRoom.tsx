import { FC, FormEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { CardSet, createRoom, loadCardSets } from "../api";


export const CreateRoom: FC<{
	onSubmit: () => void;
	onError: (e: Error) => void;
}> = ({onError, onSubmit}) => {
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
		<Form onSubmit={handleSubmit}>
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

			<Button type="submit" variant="primary">
				Create
			</Button>
		</Form>
	);
};
