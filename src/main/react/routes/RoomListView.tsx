import type { FC } from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useLoaderData } from "react-router";
import { CardSet, createRoom, deleteRoom, editRoom, loadRooms, Room } from "../api";
import { ErrorPanel } from "../components/ErrorPanel";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { RoomItem } from "../components/RoomItem";
import { useErrorHandler } from "../hooks";
import "./RoomListView.css";

interface LoaderResult {
	rooms: Room[];
}

export async function loader(): Promise<LoaderResult> {
	const rooms = await loadRooms();
	return {rooms};
}

export const RoomListView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();

	const loaderData = useLoaderData() as LoaderResult;
	const [rooms, setRooms] = useState<Room[]>(loaderData.rooms);

	const [creationModalVisible, setCreationModalVisible] = useState(false);

	const updateRooms = async () => {
		setRooms(await loadRooms());
	};

	const handleCreationSubmit = (newRoomName: string, newRoomCardSet: CardSet) => {
		setCreationModalVisible(false);
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
			<ErrorPanel error={error} onClose={resetError}></ErrorPanel>

			<header className="d-flex justify-content-between align-items-center">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={() => setCreationModalVisible(true)}>Create Room</Button>
				<CreateRoomModal onSubmit={handleCreationSubmit} show={creationModalVisible} onHide={() => setCreationModalVisible(false)}></CreateRoomModal>
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
