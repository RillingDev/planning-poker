import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import type { Card, EditAction, Room, RoomMember, SummaryResult, User } from "../api";
import { CardSet, clearVotes, createVote, editMember, editRoom, getRoom, getSummary, joinRoom, leaveRoom, Role, } from "../api";
import { AppContext } from "../AppContext";
import { CardList } from "../components/CardList";
import { ErrorPanel } from "../components/ErrorPanel";
import { MemberList } from "../components/MemberList";
import { EditRoomModal } from "../components/modal/EditRoomModal";
import { Summary } from "../components/Summary";
import { useBooleanState, useDocumentTitle, useErrorHandler, useInterval } from "../hooks";
import "./RoomView.css";

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

	return {room, summaryResult};
}

const findMemberForUser = (room: Room, user: User): RoomMember => {
	const roomMember = room.members.find(member => member.username == user.username);
	if (roomMember == null) {
		throw new TypeError("Could not find member.", roomMember);
	}
	return roomMember;
};

const findCardSet = (cardSets: ReadonlyArray<CardSet>, room: Room): CardSet => {
	const cardSet = cardSets.find(cs => cs.name == room.cardSetName);
	if (cardSet == null) {
		throw new TypeError("Invalid card set.", cardSet);
	}
	return cardSet;
};

export const RoomView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();


	const [editModalVisible, showEditModel, hideEditModal] = useBooleanState(false);
	const handleEdit = (roomTopic: string, cardSet: CardSet) => {
		hideEditModal();
		editRoom(room.name, roomTopic, cardSet.name).then(updateRoom).catch(handleError);
	};

	const {user, cardSets} = useContext(AppContext);
	const loaderData = useLoaderData() as LoaderResult;

	const [room, setRoom] = useState<Room>(loaderData.room);
	const cardSet = findCardSet(cardSets, room);
	const member = findMemberForUser(room, user);
	const [activeCard, setActiveCard] = useState<Card | null>(member.vote);

	const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(loaderData.summaryResult);

	useDocumentTitle(room.name);

	useInterval(() => {
		updateRoom().catch(handleError);
	}, 1500); // Poll for other votes

	const updateRoom = async () => {
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
	};

	const handleLeave = () => {
		leaveRoom(room.name).catch(handleError);
	};

	const handleCardClick = (card: Card) => {
		setActiveCard(card); // Update directly to give feedback before AJAX completes
		createVote(room.name, card.name).then(updateRoom).catch(handleError);
	};

	const handleAction = (member: RoomMember, action: EditAction) => {
		editMember(room.name, member.username, action).then(updateRoom).catch(handleError);
	};

	const handleRestart = () => {
		clearVotes(room.name).then(updateRoom).catch(handleError);
	};


	return (
		<>
			<ErrorPanel error={error} onClose={resetError}/>
			<header>
				<div className="d-flex justify-content-between align-items-center mb-1">
					<div className="room-view__header">
						<h2 className="mb-0">{room.name}</h2>
						<Button variant="warning" size="sm" onClick={showEditModel}>
							<FontAwesomeIcon icon={faEdit} title="Edit Room"/>
						</Button>
						<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={hideEditModal}/>
					</div>
					<nav>
						<Link to={"/"} onClick={handleLeave} className="btn btn-secondary btn-sm">
							Back to Room List
						</Link>
					</nav>
				</div>
				<span><strong>Topic:</strong> {room.topic != null ? room.topic : "-"}</span>
			</header>
			<div className="room-view">
				<main>
					<header className="d-flex justify-content-between align-items-center mb-2">
						<h3 className="mb-0">Vote</h3>
						<Button variant="warning" onClick={handleRestart} size="sm">Restart</Button>
					</header>
					<div className="card">
						{summaryResult != null ?
							<Summary voteSummary={summaryResult.votes} room={room}/> :
							<CardList cardSet={cardSet} activeCard={activeCard} disabled={member.role == Role.OBSERVER} onClick={handleCardClick}/>
						}
					</div>
				</main>
				<div>
					<h3 className="mb-2">Members</h3>
					<MemberList members={room.members ?? []} onAction={handleAction}/>
				</div>
			</div>
		</>
	);
};
