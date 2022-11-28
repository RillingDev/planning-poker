import type { FC } from "react";
import { useEffect, useState } from "react";
import { loadRooms, Room } from "../api";
import "./RoomList.css";
import Button from "react-bootstrap/Button";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
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
				<CreateRoomModal onSubmit={handleSubmit} onError={handleError} show={modalVisible} onHide={hideModal}></CreateRoomModal>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onChange={updateRooms} onError={console.error}></RoomItem>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
