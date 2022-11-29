import type { FC } from "react";
import { useEffect, useState } from "react";
import { loadRooms, Room } from "../api";
import "./RoomListView.css";
import Button from "react-bootstrap/Button";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { RoomItem } from "../components/RoomItem";


export const RoomListView: FC = () => {
	// TODO: show toast or similar for errors
	const handleError = console.error;

	const [rooms, setRooms] = useState<Room[]>([]);

	const updateRooms = () => {
		loadRooms().then(rooms => setRooms(rooms)).catch(handleError);
	};

	useEffect(() => {
		updateRooms();
	}, []);

	const [modalVisible, setModalVisible] = useState(false);
	const showModal = () => setModalVisible(true);
	const hideModal = () => setModalVisible(false);

	const handleCreationSubmit = () => {
		updateRooms();
		hideModal();
	};
	const handleCreationError = (e: Error) => {
		handleError(e);
		hideModal();
	};

	return (
		<>
			<header className="room-list__header">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={showModal}>Create Room</Button>
				<CreateRoomModal onSubmit={handleCreationSubmit} onError={handleCreationError} show={modalVisible}
								 onHide={hideModal}></CreateRoomModal>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onChange={updateRooms} onError={handleError}></RoomItem>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
