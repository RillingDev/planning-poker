import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { createRoom, deleteRoom, editRoom, getRooms } from "../api";
import { ErrorPanel } from "../components/ErrorPanel";
import { CreateRoomModal } from "../components/modal/CreateRoomModal";
import { DeleteRoomModal } from "../components/modal/DeleteRoomModal";
import { EditRoomModal } from "../components/modal/EditRoomModal";
import { useBooleanState, useErrorHandler, useInterval } from "../hooks";
import { Room, RoomCreationOptions, RoomEditOptions } from "../model";
import "./RoomListView.css";

interface LoaderResult {
  rooms: Room[];
}

export async function loader(): Promise<LoaderResult> {
  const rooms = await getRooms();
  return { rooms };
}

const RoomItem: FC<{
  room: Room;
  onEdit: (changes: Partial<Room>) => void;
  onDelete: () => void;
}> = ({ room, onEdit, onDelete }) => {
  const [editModalVisible, showEditModal, hideEditModal] =
    useBooleanState(false);

  function handleEdit(changes: RoomEditOptions) {
    hideEditModal();
    onEdit(changes);
  }

  const [deleteModalVisible, showDeleteModal, hideDeleteModal] =
    useBooleanState(false);

  function handleDelete() {
    hideDeleteModal();
    onDelete();
  }

  return (
    <div className="card room-item">
      <Link to={`/rooms/${encodeURIComponent(room.name)}`}>{room.name}</Link>

      <button
        type="button"
        className="btn btn-warning btn-sm"
        onClick={showEditModal}
      >
        <FontAwesomeIcon icon={faEdit} title="Edit Room" />
      </button>
      <EditRoomModal
        onSubmit={handleEdit}
        room={room}
        show={editModalVisible}
        onHide={hideEditModal}
      />

      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={showDeleteModal}
      >
        <FontAwesomeIcon icon={faTrash} title="Delete Room" />
      </button>
      <DeleteRoomModal
        onSubmit={handleDelete}
        room={room}
        show={deleteModalVisible}
        onHide={hideDeleteModal}
      />
    </div>
  );
};

export const RoomListView: FC = () => {
  const [error, handleError, resetError] = useErrorHandler();

  const loaderData = useLoaderData() as LoaderResult;
  const [rooms, setRooms] = useState<Room[]>(loaderData.rooms);

  const [creationModalVisible, showCreationModal, hideCreationModal] =
    useBooleanState(false);

  useInterval(() => {
    updateRooms().catch(handleError);
  }, 3000); // Poll for deletions/creations

  async function updateRooms() {
    setRooms(await getRooms());
  }

  function handleCreationSubmit(
    newRoomName: string,
    newRoomOptions: RoomCreationOptions,
  ) {
    hideCreationModal();
    createRoom(newRoomName, newRoomOptions)
      .then(updateRooms)
      .catch(handleError);
  }

  function handleEdit(room: Room, roomChanges: RoomEditOptions) {
    // No displayed data changes, so we do not need to re-fetch rooms.
    editRoom(room.name, roomChanges).catch(handleError);
  }

  function handleDelete(room: Room) {
    deleteRoom(room.name).then(updateRooms).catch(handleError);
  }

  return (
    <>
      <ErrorPanel error={error} onClose={resetError}></ErrorPanel>

      <header className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Rooms</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={showCreationModal}
          id="showCreateModalButton"
        >
          Create Room
        </button>
        <CreateRoomModal
          show={creationModalVisible}
          existingRooms={rooms}
          onSubmit={handleCreationSubmit}
          onHide={hideCreationModal}
        />
      </header>
      <nav>
        {/* TODO: make smaller */}
        <ul className="room-list__contents list-unstyled mb-0">
          {rooms.map((room) => (
            <li key={room.name}>
              <RoomItem
                room={room}
                onEdit={(changes) => handleEdit(room, changes)}
                onDelete={() => handleDelete(room)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};
