import { faEdit, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useContext, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import {
  clearVotes,
  createVote,
  editMember,
  editRoom,
  getRoom,
  getSummary,
  leaveRoom,
} from "../api.ts";
import { AppContext } from "../AppContext.ts";
import { ErrorPanel } from "../components/ErrorPanel.tsx";
import { MemberList } from "../components/MemberList.tsx";
import { EditRoomModal } from "../components/modal/EditRoomModal.tsx";
import { PokerCardList } from "../components/PokerCardList.tsx";
import { VoteSummaryDetails } from "../components/VoteSummaryDetails.tsx";
import {
  useBooleanState,
  useDocumentTitle,
  useErrorHandler,
  useInterval,
} from "../hooks.ts";
import {
  Card,
  CardSet,
  EditAction,
  Role,
  Room,
  RoomEditOptions,
  RoomMember,
  SummaryResult,
  User,
} from "../model.ts";
import "./RoomView.css";
import { getActiveExtensionsByRoom } from "../extension/extensions.ts";
import { RoomLoaderResult } from "./RoomView.loader.ts";

function findMemberForUser(room: Room, user: User): RoomMember {
  const roomMember = room.members.find(
    (member) => member.username == user.username,
  );
  if (roomMember == null) {
    throw new TypeError(`Could not find member for '${user.username}'`);
  }
  return roomMember;
}

function findCardSet(cardSets: readonly CardSet[], room: Room): CardSet {
  const cardSet = cardSets.find((cs) => cs.name == room.cardSetName);
  if (cardSet == null) {
    throw new TypeError(`Invalid card set '${room.cardSetName}'.`);
  }
  return cardSet;
}

const RoomViewHeader: FC<{
  room: Room;
  onChange: (changes: RoomEditOptions) => void;
}> = ({ room, onChange }) => {
  const [editModalVisible, showEditModal, hideEditModal] =
    useBooleanState(false);

  function handleModalEdit(changes: RoomEditOptions) {
    hideEditModal();
    onChange(changes);
  }

  const { enabledExtensions } = useContext(AppContext);

  return (
    <div className="d-flex gap-2 align-items-center">
      <h2 className="mb-0">{room.name}</h2>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={showEditModal}
      >
        <FontAwesomeIcon icon={faEdit} className="me-1" />
        Edit
      </button>
      <EditRoomModal
        onSubmit={handleModalEdit}
        room={room}
        show={editModalVisible}
        onHide={hideEditModal}
      />

      {getActiveExtensionsByRoom(enabledExtensions, room).map((extension) => (
        <extension.RoomComponent
          key={extension.key}
          room={room}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

function getHelpText(member: RoomMember, activeCard: Card | null): string {
  if (member.role == Role.OBSERVER) {
    return "You are an Observer. Please wait until all voters have voted.";
  } else if (activeCard != null) {
    return "Thank you for your vote. Please wait until everybody else has voted.";
  } else {
    return "Pick a card to vote for.";
  }
}

export const RoomView: FC = () => {
  const [error, handleError, resetError] = useErrorHandler();

  const loaderData = useLoaderData() as RoomLoaderResult;

  const { user, cardSets } = useContext(AppContext);

  const [room, setRoom] = useState<Room>(loaderData.room);
  const cardSet = findCardSet(cardSets, room);
  const member = findMemberForUser(room, user);
  const [activeCard, setActiveCard] = useState<Card | null>(member.vote);

  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    loaderData.summaryResult,
  );

  useDocumentTitle(`${room.name} - Planning Poker`);

  function handleEdit(changes: RoomEditOptions) {
    editRoom(room.name, changes).then(updateRoom).catch(handleError);
  }

  useInterval(() => {
    updateRoom().catch(handleError);
  }, 1500); // Poll for other votes

  async function updateRoom() {
    const loadedRoom = await getRoom(room.name);
    setRoom(loadedRoom);
    setActiveCard(findMemberForUser(loadedRoom, user).vote);

    if (loadedRoom.votingClosed) {
      if (summaryResult == null) {
        setSummaryResult(await getSummary(loadedRoom.name));
      }
    } else {
      setSummaryResult(null);
    }
  }

  function handleLeave() {
    leaveRoom(room.name).catch(handleError);
  }

  function handleCardClick(card: Card) {
    setActiveCard(card); // Update directly to give feedback before AJAX completes
    createVote(room.name, card.name).then(updateRoom).catch(handleError);
  }

  function handleAction(member: RoomMember, action: EditAction) {
    editMember(room.name, member.username, action)
      .then(updateRoom)
      .catch(handleError);
  }

  function handleRestart() {
    clearVotes(room.name).then(updateRoom).catch(handleError);
  }

  return (
    <>
      <ErrorPanel error={error} onClose={resetError} />
      <div className="mb-4">
        <div className="mb-1 d-flex justify-content-between align-items-center">
          <RoomViewHeader room={room} onChange={handleEdit} />
          <nav>
            <Link
              to={"/"}
              onClick={handleLeave}
              className="btn btn-link btn-sm"
            >
              Back to Room List
            </Link>
          </nav>
        </div>
        <span>
          <strong>Topic:</strong> {room.topic.length > 0 ? room.topic : "-"}
        </span>
      </div>
      <div className="room-view">
        <div>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Vote</h3>
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={handleRestart}
            >
              <FontAwesomeIcon icon={faRotate} className="me-1" />
              Restart
            </button>
          </div>
          <div className="card">
            {summaryResult != null ? (
              <VoteSummaryDetails
                voteSummary={summaryResult.votes}
                room={room}
              />
            ) : (
              <>
                <p className="text-center mt-3 mb-0">
                  {getHelpText(member, activeCard)}
                </p>
                {/* TODO: Better visualize to observers that they cannot vote */}
                <PokerCardList
                  cardSet={cardSet}
                  activeCard={activeCard}
                  disabled={member.role == Role.OBSERVER}
                  onClick={handleCardClick}
                />
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-2">Members</h3>
          <MemberList members={room.members} onAction={handleAction} />
        </div>
      </div>
    </>
  );
};
