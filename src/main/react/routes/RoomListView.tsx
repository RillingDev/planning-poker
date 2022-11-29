import type { FC } from "react";
import { useState } from "react";
import { CardSet, createRoom, loadCardSets, loadRooms, Room } from "../api";
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

	const handleRoomUpdate = () => {
		loadRooms().then(rooms => setRooms(rooms)).catch(handleError);
	};

	const [cardSets, setCardSets] = useState<CardSet[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const showModal = () => {
		setModalVisible(true);
		loadCardSets().then(loadedCardSets => setCardSets(loadedCardSets)).catch(handleError);
	};
	const hideModal = () => setModalVisible(false);

	const handleCreationSubmit = (newRoomName: string, newRoomCardSet: CardSet) => {
		hideModal();
		createRoom(newRoomName, newRoomCardSet.name)
			.then(loadRooms)
			.then(rooms => setRooms(rooms))
			.catch(handleError);
	};

	return (
		<>
			<header className="room-list__header">
				<h2>Rooms</h2>
				<Button variant="primary" onClick={showModal}>Create Room</Button>
				<CreateRoomModal onSubmit={handleCreationSubmit} show={modalVisible}
								 onHide={hideModal} cardSets={cardSets}></CreateRoomModal>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onChange={handleRoomUpdate} onError={handleError}></RoomItem>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
