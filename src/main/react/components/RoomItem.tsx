import { FC, useContext, useState } from "react";
import { deleteRoom, Role, Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { AppContext } from "../AppContext";
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

	const handleDelete = () => deleteRoom(room.name).then(() => onChange()).catch(onError);

	let {user} = useContext(AppContext);
	const mayModerate = () => room.members.some(member => member.username == user.username && member.role == Role.MODERATOR);

	return (
		<>
			<span>{room.name}</span>

			<Button variant="warning" onClick={() => setEditModalVisible(true)} hidden={!mayModerate()}>Edit</Button>
			<Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Room '{room.name}'</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EditRoom onSubmit={handleEdit} onError={onError} room={room}></EditRoom>
				</Modal.Body>
			</Modal>

			<Button variant="danger" onClick={handleDelete} hidden={!mayModerate()}>Delete</Button>

			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>
		</>
	);
};
