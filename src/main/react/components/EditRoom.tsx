import { FC, FormEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { CardSet, editRoom, loadCardSets, Room } from "../api";


/**
 * @param onSubmit Room object must be reloaded after this is fired to get latest state.
 */
export const EditRoom: FC<{
	room: Room;
	onSubmit: () => void;
	onError: (e: Error) => void;
}> = ({room, onError, onSubmit}) => {
	const [cardSets, setCardSets] = useState<CardSet[]>([]);

	const [newCardSetName, setNewCardSetName] = useState<string>("");

	useEffect(() => {
		loadCardSets().then(loadedCardSets => setCardSets(loadedCardSets)).catch(onError);
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		editRoom(room.name, newCardSetName).then(() => onSubmit()).catch(onError);
	};

	return (
		<Form onSubmit={handleSubmit}>
			<Form.Group className="mb-3" controlId="formCreateRoomCardSet">
				<Form.Label>Card Set</Form.Label>
				<Form.Select required value={newCardSetName} onChange={(e) => setNewCardSetName(e.target.value)}>
					<option disabled value=""></option>
					{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
				</Form.Select>
			</Form.Group>

			<Button type="submit" variant="primary">
				Update
			</Button>
		</Form>
	);
};
