import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useContext, useState } from "react";
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import {
  clearVotes,
  createVote,
  editMember,
  editRoom,
  getRoom,
  getSummary,
  joinRoom,
  leaveRoom,
} from "../api";
import { AppContext } from "../AppContext";
import { ErrorPanel } from "../components/ErrorPanel";
import { MemberList } from "../components/MemberList";
import { EditRoomModal } from "../components/modal/EditRoomModal";
import { PokerCardList } from "../components/PokerCardList";
import { VoteSummaryDetails } from "../components/VoteSummaryDetails";
import {
  useBooleanState,
  useDocumentTitle,
  useErrorHandler,
  useInterval,
} from "../hooks";
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
} from "../model";
import "./RoomView.css";
import { getActiveExtensionsByRoom } from "../extension/extensions.ts";

interface LoaderResult {
  room: Room;
  summaryResult: SummaryResult | null;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderResult> {
  const roomName = args.params.roomName!;

  await joinRoom(roomName);

  const room = await getRoom(roomName);

  let summaryResult = null;
  if (room.votingClosed) {
    summaryResult = await getSummary(room.name);
  }

  return { room, summaryResult };
}

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
    <div className="room-view__header">
      <h2 className="mb-0">{room.name}</h2>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={showEditModal}
      >
        <FontAwesomeIcon icon={faEdit} title="Edit Room" />
      </button>
      {/* TODO: use same icon language as with user editing */}
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

  const loaderData = useLoaderData() as LoaderResult;

  const { user, cardSets } = useContext(AppContext);

  const [room, setRoom] = useState<Room>(loaderData.room);
  const cardSet = findCardSet(cardSets, room);
  const member = findMemberForUser(room, user);
  const [activeCard, setActiveCard] = useState<Card | null>(member.vote);

  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    loaderData.summaryResult,
  );

  useDocumentTitle(room.name);

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

  const helpText = getHelpText(member, activeCard);

  return (
    <>
      <ErrorPanel error={error} onClose={resetError} />
      <header className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
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
      </header>
      <div className="room-view">
        <main>
          <header className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="mb-0">Vote</h3>
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={handleRestart}
            >
              Restart
            </button>
          </header>
          <div className="card">
            {summaryResult != null ? (
              <VoteSummaryDetails
                voteSummary={summaryResult.votes}
                room={room}
              />
            ) : (
              <>
                <p className="text-center mt-3 mb-0">{helpText}</p>
                <PokerCardList
                  cardSet={cardSet}
                  activeCard={activeCard}
                  disabled={member.role == Role.OBSERVER}
                  onClick={handleCardClick}
                />
              </>
            )}
          </div>
        </main>
        <div>
          <h3 className="mb-2">Members</h3>
          <MemberList members={room.members} onAction={handleAction} />
        </div>
      </div>
    </>
  );
};
