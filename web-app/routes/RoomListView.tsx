import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { createRoom, deleteRoom, editRoom, getRooms } from "../api.ts";
import { ErrorPanel } from "../components/ErrorPanel.tsx";
import { CreateRoomModal } from "../components/modal/CreateRoomModal.tsx";
import { DeleteRoomModal } from "../components/modal/DeleteRoomModal.tsx";
import { EditRoomModal } from "../components/modal/EditRoomModal.tsx";
import { useBooleanState, useErrorHandler, useInterval } from "../hooks.ts";
import { Room, RoomCreationOptions, RoomEditOptions } from "../model.ts";
import { RoomListLoaderResult } from "./RoomListView.loader.ts";

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
    <div className="card p-3 d-flex flex-row justify-content-between align-items-center">
      <Link to={`/rooms/${encodeURIComponent(room.name)}`}>{room.name}</Link>

      <div className="btn-group">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={showEditModal}
        >
          <FontAwesomeIcon icon={faEdit} className="me-1" />
          Edit
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
          <FontAwesomeIcon icon={faTrash} className="me-1" />
          Delete
        </button>
        <DeleteRoomModal
          onSubmit={handleDelete}
          room={room}
          show={deleteModalVisible}
          onHide={hideDeleteModal}
        />
      </div>
    </div>
  );
};

export const RoomListView: FC = () => {
  const [error, handleError, resetError] = useErrorHandler();

  const loaderData = useLoaderData() as RoomListLoaderResult;
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

      <div className="d-flex mb-3 justify-content-between align-items-center">
        <h2 className="mb-0">Rooms</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={showCreationModal}
          id="showCreateModalButton"
        >
          <FontAwesomeIcon icon={faPlus} className="me-1" />
          Create Room
        </button>
        <CreateRoomModal
          show={creationModalVisible}
          existingRooms={rooms}
          onSubmit={handleCreationSubmit}
          onHide={hideCreationModal}
        />
      </div>
      <nav>
        {/* TODO: make smaller */}
        <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
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
