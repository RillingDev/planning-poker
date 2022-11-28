import { FC, useState } from "react";
import { Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { EditRoomModal } from "./modal/EditRoomModal";
import "./RoomItem.css";
import { DeleteRoomModal } from "./modal/DeleteRoomModal";

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
		setDeleteModalVisible(false);
		onChange();
	};

	return (
		<div className="room-item">
			<span>{room.name}</span>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>

			<Button variant="warning" onClick={() => setEditModalVisible(true)}>Edit</Button>
			<EditRoomModal onSubmit={handleEdit} onError={onError} room={room} show={editModalVisible}
						   onHide={() => setEditModalVisible(false)}/>

			<Button variant="danger" onClick={() => setDeleteModalVisible(true)}>Delete</Button>
			<DeleteRoomModal onSubmit={handleDelete} onError={onError} room={room} show={deleteModalVisible}
							 onHide={() => setDeleteModalVisible(false)}/>
		</div>
	);
};
