import { FC } from "react";
import { deleteRoom, Room } from "../api";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";


export const RoomItem: FC<{
	room: Room;
	onDelete: () => void;
}> = ({room, onDelete}) => {
	const handleDelete = () => deleteRoom(room.name).then(() => onDelete());
	// TODO: only show delete if delete is possible

	return (
		<>
			{room.name}
			<Button variant="danger" onClick={handleDelete}>Delete</Button>
			<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>
		</>
	);
};