import { isEqual } from "lodash-es";
import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { ExtensionKey, Room, RoomEditOptions } from "../../api";
import { AppContext } from "../../AppContext";
import { Extension } from "../../extension/Extension";

/**
 * Gets the new value, or undefined if it has not changed.
 * This is useful when a value is only needed if it was modified.
 */
function getChange<T>(oldValue: T, newValue: T): T | undefined {
	return isEqual(oldValue, newValue) ? undefined : newValue;
}


export const EditRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: (changes: RoomEditOptions) => void;
}> = ({room, show, onHide, onSubmit}) => {
	const {cardSets, extensionManager} = useContext(AppContext);

	const [cardSetName, setCardSetName] = useState<string>(room.cardSetName);
	const [topic, setTopic] = useState<string>(room.topic ?? "");
	const [extensionKeys, setExtensionKeys] = useState<ReadonlyArray<ExtensionKey>>(room.extensions);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// Only emit difference to initial.
		onSubmit({
			topic: getChange(room.topic, topic),
			cardSetName: getChange(room.cardSetName, cardSetName),
			extensions: getChange(room.extensions, extensionKeys),
		});
	};

	const handleExtensionChange = (e: ChangeEvent<HTMLInputElement>, changedExtension: Extension) => {
		setExtensionKeys(prevState => {
			if (e.target.checked) {
				return [...prevState, changedExtension.key];
			} else {
				return prevState.filter(extensionKey => extensionKey != changedExtension.key);
			}
		});
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
						<Form.Select required value={cardSetName} onChange={(e) => setCardSetName(e.target.value)}>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formEditRoomTopic">
						<Form.Label>Topic</Form.Label>
						<Form.Control as="textarea" value={topic} onChange={(e) => setTopic(e.target.value)}/>
					</Form.Group>
					<Form.Group className="mb-3">
						<fieldset>
							<legend className="h6">Extensions</legend>
							{extensionManager.getAll().map(extension =>
								<Form.Check
									inline
									key={extension.key}
									id={`extension-${extension.key}`}
									label={extension.label}
									checked={extensionKeys.includes(extension.key)}
									onChange={(e) => handleExtensionChange(e, extension)}
								/>
							)}
						</fieldset>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" variant="primary">Update</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
