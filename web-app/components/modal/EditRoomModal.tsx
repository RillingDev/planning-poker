import { isEqual } from "lodash-es";
import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { AppContext } from "../../AppContext";
import { Extension } from "../../extension/Extension";
import { ExtensionKey, Room, RoomEditOptions } from "../../model";

/**
 * Gets the new value, or undefined if it has not changed.
 * This is useful when a value is only needed if it was modified.
 */
function getDelta<T>(oldValue: T, newValue: T): T | undefined {
  return isEqual(oldValue, newValue) ? undefined : newValue;
}

/**
 * @param onSubmit Invoked upon submission with delta of changes values.
 */
export const EditRoomModal: FC<{
  show: boolean;
  onHide: () => void;
  onSubmit: (changes: RoomEditOptions) => void;
  ariaLabelledBy: string;
  room: Room;
}> = ({ room, show, onHide, onSubmit, ariaLabelledBy }) => {
  const { cardSets, extensionManager } = useContext(AppContext);

  // Initial state is filled in handleShow, to ensure is reset when opening the modal.
  const [cardSetName, setCardSetName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [extensionKeys, setExtensionKeys] = useState<readonly ExtensionKey[]>(
    [],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Only emit difference to initial.
    onSubmit({
      topic: getDelta(room.topic, topic),
      cardSetName: getDelta(room.cardSetName, cardSetName),
      extensions: getDelta(room.extensions, extensionKeys),
    });
  }

  function handleExtensionChange(
    e: ChangeEvent<HTMLInputElement>,
    changedExtension: Extension,
  ) {
    setExtensionKeys((prevState) => {
      if (e.target.checked) {
        return [...prevState, changedExtension.key];
      } else {
        return prevState.filter(
          (extensionKey) => extensionKey != changedExtension.key,
        );
      }
    });
  }

  function handleShow() {
    setCardSetName(room.cardSetName);
    setTopic(room.topic);
    setExtensionKeys(room.extensions);
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      onShow={handleShow}
      aria-labelledby={ariaLabelledBy}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Room &apos;{room.name}&apos;</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formEditRoomCardSet">
            <Form.Label>Card Set</Form.Label>
            <Form.Select
              required
              value={cardSetName}
              onChange={(e) => setCardSetName(e.target.value)}
            >
              {cardSets.map((cardSet) => (
                <option key={cardSet.name}>{cardSet.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEditRoomTopic">
            <Form.Label>Topic</Form.Label>
            <Form.Control
              as="textarea"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </Form.Group>
          <div className="mb-3">
            <fieldset>
              <legend className="h6">Extensions</legend>
              {extensionManager.getAll().map((extension) => (
                <Form.Check
                  inline
                  type="checkbox"
                  key={extension.key}
                  id={`extension-${extension.key}`}
                  label={extension.label}
                  checked={extensionKeys.includes(extension.key)}
                  onChange={(e) => handleExtensionChange(e, extension)}
                />
              ))}
            </fieldset>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="submit" className="btn btn-primary">
            Edit
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
