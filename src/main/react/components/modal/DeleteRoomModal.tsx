import { FC } from "react";
import Button from "react-bootstrap/Button";
import { deleteRoom, Room } from "../../api";
import Modal from "react-bootstrap/Modal";


/**
 * @param onSubmit Room object must be reloaded after this is fired to get latest state.
 */
export const DeleteRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onSubmit: () => void;
	onError: (e: Error) => void;
}> = ({room, show, onHide, onError, onSubmit}) => {
	const handleDelete = () => {
		deleteRoom(room.name).then(() => onSubmit()).catch(onError);
	};

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Delete Room &apos;{room.name}&apos;</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Are you sure you want to delete this room?
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={handleDelete}>Permanently Delete This Room</Button>
			</Modal.Footer>
		</Modal>
	);
};
