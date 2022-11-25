import type { FC } from "react";
import { useEffect, useState } from "react";
import { loadRooms, Room } from "../api";
import "./RoomList.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { CreateRoom } from "../components/CreateRoom";
import { RoomItem } from "../components/RoomItem";


export const RoomList: FC = () => {
	const [rooms, setRooms] = useState<Room[]>([]);

	const updateRooms = () => {
		loadRooms().then(rooms => setRooms(rooms)).catch(console.error);
	};

	useEffect(() => {
		updateRooms();
	}, []);

	const [modalVisible, setModalVisible] = useState(false);
	const showModal = () => setModalVisible(true);
	const hideModal = () => setModalVisible(false);

	// TODO: show toast or similar for errors
	const handleSubmit = () => {
		updateRooms();
		hideModal();
	};
	const handleError = (e: Error) => {
		console.error(e);
		hideModal();
	};

	return (
		<>
			<header className="room-list__header">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={showModal}>Create Room</Button>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name} className="room-list__room">
							<RoomItem room={room} onDelete={updateRooms}></RoomItem>
						</li>
					)}
				</ul>
			</nav>

			<Modal show={modalVisible} onHide={hideModal}>
				<Modal.Header closeButton>
					<Modal.Title>Create Room</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreateRoom onSubmit={handleSubmit} onError={handleError}></CreateRoom>
				</Modal.Body>
			</Modal>
		</>
	);
};