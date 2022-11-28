import { FC, useState } from "react";
import { deleteRoom, Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { EditRoom } from "./EditRoom";

export const RoomItem: FC<{
	room: Room;
	onChange: () => void;
	onError: (e: Error) => void;
}> = ({room, onChange, onError}) => {
	const [editModalVisible, setEditModalVisible] = useState(false);
	const handleEdit = () => {
		setEditModalVisible(false);
		onChange();
	};

	const handleDelete = () => {
		deleteRoom(room.name).then(() => onChange()).catch(onError);
	};

	return (
		<>
			<span>{room.name}</span>

			<Button variant="warning" onClick={() => setEditModalVisible(true)}>Edit</Button>
			<Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Room &apos;{room.name}&apos;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EditRoom onSubmit={handleEdit} onError={onError} room={room}></EditRoom>
				</Modal.Body>
			</Modal>

			<Button variant="danger" onClick={handleDelete}>Delete</Button>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>
		</>
	);
};
