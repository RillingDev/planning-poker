import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { CardSet, Room } from "../../api";
import { AppContext } from "../../AppContext";
import { Extension } from "../../extension/Extension";

interface SuggestionResult {
	readonly content: string;
	readonly extension: Extension;
}

async function loadSuggestions(newTopic: string, extensions: ReadonlyArray<Extension>): Promise<SuggestionResult[]> {
	const suggestionResultPromises = extensions.map(extension => extension.loadSuggestion(newTopic).then(content => ({
		extension,
		content
	})));
	const lookupResults = await Promise.all(suggestionResultPromises);
	return lookupResults.filter(result => result.content != null) as SuggestionResult[];
}

export const EditRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: (roomTopic: string, cardSet: CardSet) => void;
}> = ({room, show, onHide, onSubmit}) => {
	const {cardSets, extensions} = useContext(AppContext);

	const [newCardSetName, setNewCardSetName] = useState<string>(room.cardSetName);
	const [roomTopic, setRoomTopic] = useState<string>(room.topic ?? "");

	const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit(roomTopic, cardSets.find(cardSet => cardSet.name == newCardSetName)!);
	};

	const onTopicChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newTopic = e.target.value;
		setRoomTopic(newTopic);
		loadSuggestions(newTopic, extensions).then(setSuggestions).catch(console.error);
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
					<Form.Group className="mb-3" controlId="formEditRoomTopic">
						<Form.Label>Topic</Form.Label>
						<Form.Control as="textarea" value={roomTopic} onChange={onTopicChange}/>
					</Form.Group>
					<ul>
						{suggestions.map(suggestion => <li key={suggestion.extension.id}>{suggestion.content} - {suggestion.extension.id}</li>)}
					</ul>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">Update</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
