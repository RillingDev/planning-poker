import { FC } from "react";
import Button from "react-bootstrap/Button";
import { Room } from "../../api";
import Modal from "react-bootstrap/Modal";


export const DeleteRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
}> = ({room, show, onHide, onSubmit}) => {
	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Delete Room &apos;{room.name}&apos;</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Are you sure you want to delete this room?
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={() => onSubmit()}>Permanently Delete This Room</Button>
			</Modal.Footer>
		</Modal>
	);
};
