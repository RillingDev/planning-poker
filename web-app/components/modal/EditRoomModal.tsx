import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { ExtensionKey, Room, RoomEditOptions } from "../../api";
import { AppContext } from "../../AppContext";
import { Extension } from "../../extension/Extension";


export const EditRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: (changes: RoomEditOptions) => void;
}> = ({room, show, onHide, onSubmit}) => {
	const {cardSets, extensionManager} = useContext(AppContext);

	const [newCardSetName, setNewCardSetName] = useState<string>(room.cardSetName);
	const [roomTopic, setRoomTopic] = useState<string>(room.topic ?? "");
	const [extensionKeys, setExtensionKeys] = useState<ReadonlyArray<ExtensionKey>>(room.extensions);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit({topic: roomTopic, cardSetName: newCardSetName, extensions: extensionKeys});
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
						<Form.Select required value={newCardSetName} onChange={(e) => setNewCardSetName(e.target.value)}>
							{cardSets.map(cardSet => <option key={cardSet.name}>{cardSet.name}</option>)}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formEditRoomTopic">
						<Form.Label>Topic</Form.Label>
						<Form.Control as="textarea" value={roomTopic} onChange={(e) => setRoomTopic(e.target.value)}/>
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
