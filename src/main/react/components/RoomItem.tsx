import { FC, useState } from "react";
import { CardSet, Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { EditRoomModal } from "./modal/EditRoomModal";
import "./RoomItem.css";
import { DeleteRoomModal } from "./modal/DeleteRoomModal";

export const RoomItem: FC<{
	room: Room;
	onEdit: (cardSet: CardSet) => void;
	onDelete: () => void;
}> = ({room, onEdit, onDelete}) => {
	const [editModalVisible, setEditModalVisible] = useState(false);
	const handleEdit = (newCardSet: CardSet) => {
		setEditModalVisible(false);
		onEdit(newCardSet);
	};

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const handleDelete = () => {
		setDeleteModalVisible(false);
		onDelete();
	};

	return (
		<div className="room-item">
			<span>{room.name}</span>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>

			<Button variant="warning" onClick={() => setEditModalVisible(true)}>Edit</Button>
			<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={() => setEditModalVisible(false)}/>

			<Button variant="danger" onClick={() => setDeleteModalVisible(true)}>Delete</Button>
			<DeleteRoomModal onSubmit={handleDelete} room={room} show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)}/>
		</div>
	);
};
