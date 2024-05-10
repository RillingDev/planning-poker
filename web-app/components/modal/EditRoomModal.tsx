import { isEqual } from "lodash-es";
import { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { AppContext } from "../../AppContext.ts";
import { Extension } from "../../extension/Extension.ts";
import { ExtensionKey, Room, RoomEditOptions } from "../../model.ts";

/**
 * Gets the new value, or undefined if it has not changed.
 * This is useful when a value is only needed if it was modified.
 */
function getDelta<T>(oldValue: T, newValue: T): T | undefined {
  return isEqual(oldValue, newValue) ? undefined : newValue;
}

export const EditRoomModal: FC<{
  show: boolean;
  onHide: () => void;
  /**
   * Invoked upon submission with delta of changes values.
   */
  onSubmit: (changes: RoomEditOptions) => void;
  room: Room;
}> = ({ room, show, onHide, onSubmit }) => {
  const { cardSets, enabledExtensions } = useContext(AppContext);

  // The initial state is filled in handleShow, to ensure is reset when opening the modal.
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
      aria-labelledby="editRoomModalTitle"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title id="editRoomModalTitle">
            Edit Room &apos;{room.name}&apos;
          </Modal.Title>
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
              {enabledExtensions.map((extension) => (
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
            Submit
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
