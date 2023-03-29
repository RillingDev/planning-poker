import { FC } from "react";
import { Modal } from "react-bootstrap";
import { Room } from "../../model";

export const DeleteRoomModal: FC<{
  room: Room;
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
}> = ({ room, show, onHide, onSubmit }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Room &apos;{room.name}&apos;</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this room?</Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-danger" onClick={onSubmit}>
          Permanently Delete This Room
        </button>
      </Modal.Footer>
    </Modal>
  );
};
