import { FC, useState } from "react";
import { deleteRoom, Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { EditRoom } from "./EditRoom";
import "./RoomItem.css";

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

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const handleDelete = () => {
		deleteRoom(room.name).then(() => setDeleteModalVisible(false)).then(() => onChange()).catch(onError);
	};

	return (
		<div className="room-item">
			<span>{room.name}</span>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>

			<Button variant="warning" onClick={() => setEditModalVisible(true)}>Edit</Button>
			<Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Room &apos;{room.name}&apos;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EditRoom onSubmit={handleEdit} onError={onError} room={room}></EditRoom>
				</Modal.Body>
			</Modal>

			<Button variant="danger" onClick={() => setDeleteModalVisible(true)}>Delete</Button>
			<Modal show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)}>
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
		</div>
	);
};
