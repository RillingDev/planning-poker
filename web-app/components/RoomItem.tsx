import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Room, RoomEditOptions } from "../api";
import { useBooleanState } from "../hooks";
import { DeleteRoomModal } from "./modal/DeleteRoomModal";
import { EditRoomModal } from "./modal/EditRoomModal";
import "./RoomItem.css";

export const RoomItem: FC<{
	room: Room;
	onEdit: (changes: Partial<Room>) => void;
	onDelete: () => void;
}> = ({room, onEdit, onDelete}) => {
	const [editModalVisible, showEditModal, hideEditModal] = useBooleanState(false);
	const handleEdit = (changes: RoomEditOptions) => {
		hideEditModal();
		onEdit(changes);
	};

	const [deleteModalVisible, showDeleteModal, hideDeleteModal] = useBooleanState(false);
	const handleDelete = () => {
		hideDeleteModal();
		onDelete();
	};

	return (
		<div className="card room-item">
			<Link to={`/rooms/${encodeURIComponent(room.name)}`}>{room.name}</Link>

			<Button size="sm" variant="warning" onClick={showEditModal}><FontAwesomeIcon icon={faEdit} title="Edit Room"/></Button>
			<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={hideEditModal}/>

			<Button size="sm" variant="danger" onClick={showDeleteModal}><FontAwesomeIcon icon={faTrash} title="Delete Room"/></Button>
			<DeleteRoomModal onSubmit={handleDelete} room={room} show={deleteModalVisible} onHide={hideDeleteModal}/>
		</div>
	);
};
