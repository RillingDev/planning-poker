import type { FC } from "react";
import { useState } from "react";
import { CardSet, createRoom, deleteRoom, editRoom, loadRooms, Room } from "../api";
import "./RoomListView.css";
import Button from "react-bootstrap/Button";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { RoomItem } from "../components/RoomItem";
import { useLoaderData } from "react-router";

interface LoaderResult {
	rooms: Room[];
}

export async function loader(): Promise<LoaderResult> {
	const rooms = await loadRooms();
	return {rooms};
}

export const RoomListView: FC = () => {
	// TODO: show toast or similar for errors
	const handleError = console.error;

	const loaderData = useLoaderData() as LoaderResult;

	const [rooms, setRooms] = useState<Room[]>(loaderData.rooms);

	const [modalVisible, setModalVisible] = useState(false);
	const showModal = () => setModalVisible(true);
	const hideModal = () => setModalVisible(false);

	const updateRooms = async () => {
		setRooms(await loadRooms());
	};

	const handleCreationSubmit = (newRoomName: string, newRoomCardSet: CardSet) => {
		hideModal();
		createRoom(newRoomName, newRoomCardSet.name)
			.then(updateRooms)
			.catch(handleError);
	};

	const handleEdit = (room: Room, newCardSet: CardSet) => {
		editRoom(room.name, newCardSet.name).then(updateRooms).catch(handleError);
	};

	const handleDelete = (room: Room) => {
		deleteRoom(room.name).then(updateRooms).catch(handleError);
	};

	return (
		<>
			<header className="room-list__header">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={showModal}>Create Room</Button>
				<CreateRoomModal onSubmit={handleCreationSubmit} show={modalVisible} onHide={hideModal}></CreateRoomModal>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onEdit={(newCardSet) => handleEdit(room, newCardSet)} onDelete={() => handleDelete(room)}></RoomItem>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
