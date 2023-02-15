import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { createRoom, deleteRoom, editRoom, loadRooms, Room, RoomCreationOptions, RoomEditOptions } from "../api";
import { ErrorPanel } from "../components/ErrorPanel";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { DeleteRoomModal } from "../components/modal/DeleteRoomModal";
import { EditRoomModal } from "../components/modal/EditRoomModal";
import { useBooleanState, useErrorHandler, useInterval } from "../hooks";
import "./RoomListView.css";

interface LoaderResult {
	rooms: Room[];
}

export async function loader(): Promise<LoaderResult> {
	const rooms = await loadRooms();
	return {rooms};
}


const RoomItem: FC<{
	room: Room;
	onEdit: (changes: Partial<Room>) => void;
	onDelete: () => void;
}> = ({room, onEdit, onDelete}) => {
	const [editModalVisible, showEditModal, hideEditModal] = useBooleanState(false);
	const handleEdit = (changes: RoomEditOptions) => {
		hideEditModal();
		onEdit(changes);
	};

	const [deleteModalVisible, showDeleteModal, hideDeleteModal] = useBooleanState(false);
	const handleDelete = () => {
		hideDeleteModal();
		onDelete();
	};

	return (
		<div className="card room-item">
			<Link to={`/rooms/${encodeURIComponent(room.name)}`}>{room.name}</Link>

			<Button size="sm" variant="warning" onClick={showEditModal}><FontAwesomeIcon icon={faEdit} title="Edit Room"/></Button>
			<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={hideEditModal}/>

			<Button size="sm" variant="danger" onClick={showDeleteModal}><FontAwesomeIcon icon={faTrash} title="Delete Room"/></Button>
			<DeleteRoomModal onSubmit={handleDelete} room={room} show={deleteModalVisible} onHide={hideDeleteModal}/>
		</div>
	);
};

export const RoomListView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();

	const loaderData = useLoaderData() as LoaderResult;
	const [rooms, setRooms] = useState<Room[]>(loaderData.rooms);

	const [creationModalVisible, showCreationModal, hideCreationModal] = useBooleanState(false);

	useInterval(() => {
		updateRooms().catch(handleError);
	}, 3000); // Poll for deletions/creations

	const updateRooms = async () => {
		setRooms(await loadRooms());
	};

	const handleCreationSubmit = (newRoomName: string, newRoomOptions: RoomCreationOptions) => {
		hideCreationModal();
		createRoom(newRoomName, newRoomOptions)
			.then(updateRooms)
			.catch(handleError);
	};

	const handleEdit = (room: Room, roomChanges: RoomEditOptions) => {
		editRoom(room.name, roomChanges).then(updateRooms).catch(handleError);
	};

	const handleDelete = (room: Room) => {
		deleteRoom(room.name).then(updateRooms).catch(handleError);
	};

	return (
		<>
			<ErrorPanel error={error} onClose={resetError}></ErrorPanel>

			<header className="d-flex justify-content-between align-items-center">
				<h2 className="mb-0">Rooms</h2>
				<Button variant="primary" size="sm" onClick={showCreationModal}>Create Room</Button>
				<CreateRoomModal show={creationModalVisible} existingRooms={rooms} onSubmit={handleCreationSubmit} onHide={hideCreationModal}/>
			</header>
			<nav>
				<ul className="room-list">
					{rooms.map(room =>
						<li key={room.name}>
							<RoomItem room={room} onEdit={(changes) => handleEdit(room, changes)} onDelete={() => handleDelete(room)}/>
						</li>,
					)}
				</ul>
			</nav>
		</>
	);
};
