import { Link, useLoaderData } from "react-router-dom";
import type { FC } from "react";
import { useState } from "react";
import { loadRooms, Room } from "../api";
import "./RoomList.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export async function loader() {
	const rooms = await loadRooms();
	return {rooms};
}

export const RoomList: FC = () => {
	const {rooms} = useLoaderData() as { rooms: ReadonlyArray<Room> };

	const [showCreateModal, setShowCreateModal] = useState(false);

	return (
		<>
			<header className="room-list__header">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Room</Button>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name} className="room-list__room">
							{room.name}
							<Link to={`/rooms/${encodeURIComponent(room.name)}`} className="btn btn-primary">Join</Link>
						</li>
					)}
				</ul>
			</nav>

			<Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Modal heading</Modal.Title>
				</Modal.Header>
				<Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={() => setShowCreateModal(false)}>
						Save Changes
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};