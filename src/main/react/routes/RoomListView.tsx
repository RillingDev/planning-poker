import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useLoaderData } from "react-router";
import { CardSet, createRoom, deleteRoom, editRoom, loadRooms, Room } from "../api";
import { ErrorPanel } from "../components/ErrorPanel";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { RoomItem } from "../components/RoomItem";
import { useErrorHandler, useInterval } from "../hooks";
import "./RoomListView.css";

interface LoaderResult {
	rooms: Room[];
}

export async function loader(): Promise<LoaderResult> {
	const rooms = await loadRooms();
	return {rooms};
}

const originalDocumentTitle = document.title;

export const RoomListView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();

	const loaderData = useLoaderData() as LoaderResult;
	const [rooms, setRooms] = useState<Room[]>(loaderData.rooms);

	const [creationModalVisible, setCreationModalVisible] = useState(false);

	useEffect(() => {
		document.title = originalDocumentTitle;
	}, []);

	useInterval(() => {
		updateRooms().catch(handleError);
	}, 3000); // Poll for deletions/creations

	const updateRooms = async () => {
		setRooms(await loadRooms());
	};

	const handleCreationSubmit = (newRoomName: string, newRoomTopic: string, cardSet: CardSet) => {
		setCreationModalVisible(false);
		createRoom(newRoomName, newRoomTopic, cardSet.name)
			.then(updateRooms)
			.catch(handleError);
	};

	const handleEdit = (room: Room, roomTopic: string, cardSet: CardSet) => {
		editRoom(room.name, roomTopic, cardSet.name).then(updateRooms).catch(handleError);
	};

	const handleDelete = (room: Room) => {
		deleteRoom(room.name).then(updateRooms).catch(handleError);
	};

	return (
		<>
			<ErrorPanel error={error} onClose={resetError}></ErrorPanel>

			<header className="d-flex justify-content-between align-items-center">
				<h2 className="mb-0">Rooms</h2>
				<Button variant="primary" size="sm" onClick={() => setCreationModalVisible(true)}>Create Room</Button>
				<CreateRoomModal show={creationModalVisible} existingRooms={rooms} onSubmit={handleCreationSubmit}
								 onHide={() => setCreationModalVisible(false)}></CreateRoomModal>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onEdit={(roomTopic, cardSet) => handleEdit(room, roomTopic, cardSet)}
									  onDelete={() => handleDelete(room)}></RoomItem>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
