import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { CardSet, Room } from "../api";
import { DeleteRoomModal } from "./modal/DeleteRoomModal";
import { EditRoomModal } from "./modal/EditRoomModal";
import "./RoomItem.css";

export const RoomItem: FC<{
	room: Room;
	onEdit: (roomTopic: string, cardSet: CardSet) => void;
	onDelete: () => void;
}> = ({room, onEdit, onDelete}) => {
	const [editModalVisible, setEditModalVisible] = useState(false);
	const handleEdit = (roomTopic: string, newCardSet: CardSet) => {
		setEditModalVisible(false);
		onEdit(roomTopic, newCardSet);
	};

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const handleDelete = () => {
		setDeleteModalVisible(false);
		onDelete();
	};

	return (
		<div className="card room-item">
			<span>{room.name}</span>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>

			<Button variant="warning" onClick={() => setEditModalVisible(true)}><FontAwesomeIcon icon={faEdit} title="Edit Room"/></Button>
			<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={() => setEditModalVisible(false)}/>

			<Button variant="danger" onClick={() => setDeleteModalVisible(true)}><FontAwesomeIcon icon={faTrash} title="Delete Room"/></Button>
			<DeleteRoomModal onSubmit={handleDelete} room={room} show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)}/>
		</div>
	);
};
