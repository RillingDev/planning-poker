import { FC, useState } from "react";
import { CardSet, deleteRoom, editRoom, loadCardSets, Room } from "../api";
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
	const handleEdit = (newCardSet: CardSet) => {
		setEditModalVisible(false);
		editRoom(room.name, newCardSet.name).then(() => onChange()).catch(onError);
	};

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [cardSets, setCardSets] = useState<CardSet[]>([]);
	const showEditModal = () => {
		setEditModalVisible(true);
		loadCardSets().then(loadedCardSets => setCardSets(loadedCardSets)).catch(onError);
	};
	const handleDelete = () => {
		setDeleteModalVisible(false);
		deleteRoom(room.name).then(() => onChange()).catch(onError);
	};

	return (
		<div className="room-item">
			<span>{room.name}</span>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>

			<Button variant="warning" onClick={showEditModal}>Edit</Button>
			<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible}
						   onHide={() => setEditModalVisible(false)} cardSets={cardSets}/>

			<Button variant="danger" onClick={() => setDeleteModalVisible(true)}>Delete</Button>
			<DeleteRoomModal onSubmit={handleDelete} room={room} show={deleteModalVisible}
							 onHide={() => setDeleteModalVisible(false)}/>
		</div>
	);
};
