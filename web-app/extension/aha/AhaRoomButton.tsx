import { ChangeEvent, FC, FormEvent, useState } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { ErrorPanel } from "../../components/ErrorPanel.tsx";
import { useBooleanState, useErrorHandler } from "../../hooks.ts";
import { Room, RoomEditOptions } from "../../model.ts";
import { ahaExtension, AhaExtension } from "./AhaExtension.ts";
import { Idea } from "./model.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";

type LoadedIdea = Idea<"name" | "reference_num">;

function deriveTopic(idea: LoadedIdea): string {
  return `${idea.reference_num}: ${idea.name}`;
}

const AhaIdeaLoadingModal: FC<{
  show: boolean;
  onHide: () => void;
  onSubmit: (changes: RoomEditOptions) => void;
}> = ({ show, onHide, onSubmit }) => {
  const [error, handleError, resetError] = useErrorHandler();

  const [ideaLoading, setIdeaLoading] = useState(false);
  const [idea, setIdea] = useState<LoadedIdea | null>(null);

  const [input, setInput] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setInput(newValue);

    const extractedIdeaId = AhaExtension.extractIdeaId(newValue);
    if (extractedIdeaId == null) {
      e.target.setCustomValidity("Not a valid Aha! idea URL/ID.");
      return;
    }

    setIdea(null);
    setIdeaLoading(true);
    ahaExtension
      .getClient()
      .then((c) => c.getIdea(extractedIdeaId, ["name", "reference_num"]))
      .then((result) => {
        setIdea(result?.idea ?? null);
        e.target.setCustomValidity(result == null ? "Idea not found." : "");
      })
      .catch(handleError)
      .finally(() => setIdeaLoading(false));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    onSubmit({ topic: deriveTopic(idea!) });
  }

  function handleExit(): void {
    resetError();
    setInput("");
    setIdea(null);
  }

  return (
    <Modal
      show={show}
      onExit={handleExit}
      onHide={onHide}
      aria-labelledby="ahaIdeaLoadingModalTitle"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title id="ahaIdeaLoadingModalTitle">
            Load from Aha!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorPanel
            error={error}
            onClose={resetError}
            dismissible={false}
          ></ErrorPanel>
          <p>
            Please enter an Aha! Idea ID or URL to load its details into the
            application.
          </p>
          <Form.Group className="mb-3" controlId="formAhaUrl">
            <Form.Label>Aha! URL/ID</Form.Label>
            <Form.Control
              type="search"
              required
              onChange={handleChange}
              value={input}
            />
          </Form.Group>
          <Spinner
            hidden={!ideaLoading}
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          >
            <span className="visually-hidden">Loading Idea</span>
          </Spinner>
          <div className="card" hidden={idea == null}>
            <div className="card-header">Preview</div>
            <div className="card-body">
              {idea != null ? deriveTopic(idea) : ""}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={ideaLoading || error != null}
          >
            Import Idea
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const AhaRoomButton: FC<{
  room: Room;
  onChange: (changes: RoomEditOptions) => void;
}> = ({ onChange }) => {
  const [modalVisible, showModal, hideModal] = useBooleanState(false);

  function handleSubmit(changes: RoomEditOptions) {
    onChange(changes);
    hideModal();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={showModal}
        id="ahaShowRoomModalButton"
      >
        <FontAwesomeIcon icon={faFileImport} className="me-1" />
        Load from Aha!
      </button>
      <AhaIdeaLoadingModal
        show={modalVisible}
        onHide={hideModal}
        onSubmit={handleSubmit}
      />
    </>
  );
};
