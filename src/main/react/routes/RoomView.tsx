import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import type { Card, EditAction, Room, RoomMember, SummaryResult, User } from "../api";
import { CardSet, clearVotes, createVote, editMember, editRoom, getRoom, getSummary, joinRoom, leaveRoom, Role } from "../api";
import { AppContext } from "../AppContext";
import { CardList } from "../components/CardList";
import { ErrorPanel } from "../components/ErrorPanel";
import { MemberList } from "../components/MemberList";
import { EditRoomModal } from "../components/modal/EditRoomModal";
import { Summary } from "../components/Summary";
import { useErrorHandler, useInterval } from "../hooks";
import "./RoomView.css";

interface LoaderResult {
	room: Room;
	summaryResult: SummaryResult | null;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderResult> {
	const roomName = args.params.roomName as string;

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
		throw new TypeError("Could not find member.");
	}
	return roomMember;
};

export const RoomView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();


	const [editModalVisible, setEditModalVisible] = useState(false);
	const handleEdit = (roomTopic: string, cardSet: CardSet) => {
		setEditModalVisible(false);
		editRoom(room.name, roomTopic, cardSet.name).then(updateRoom).catch(handleError);
	};

	const {user} = useContext(AppContext);
	const loaderData = useLoaderData() as LoaderResult;
	const [room, setRoom] = useState<Room>(loaderData.room);
	const [member, setMember] = useState<RoomMember>(findMemberForUser(room, user));
	const [activeCard, setActiveCard] = useState<Card | null>(member.vote);

	const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(loaderData.summaryResult);

	useEffect(() => {
		document.title = room.name;
	}, [room.name]);

	useInterval(() => {
		updateRoom().catch(handleError);
	}, 1500); // Poll for other votes

	const updateRoom = async () => {
		const loadedRoom = await getRoom(room.name);
		setRoom(loadedRoom);
		const loadedMember = findMemberForUser(loadedRoom, user);
		setMember(loadedMember);
		setActiveCard(loadedMember.vote);

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
			<ErrorPanel error={error} onClose={resetError}></ErrorPanel>

			<header>
				<div className="d-flex justify-content-between align-items-center mb-1">
					<div className="room-view__header">
						<h2 className="mb-0">{room.name}</h2>
						<Button variant="warning" size="sm" onClick={() => setEditModalVisible(true)}><FontAwesomeIcon icon={faEdit} title="Edit Room"/></Button>
						<EditRoomModal onSubmit={handleEdit} room={room} show={editModalVisible} onHide={() => setEditModalVisible(false)}/>
					</div>
					<nav>
						<Link to={"/"} onClick={() => handleLeave()} className="btn btn-secondary btn-sm">Back to Room List</Link>
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
							<Summary voteSummary={summaryResult.votes} room={room}></Summary> :
							<CardList cardSet={room.cardSet} activeCard={activeCard} disabled={member.role == Role.OBSERVER} onClick={handleCardClick}></CardList>
						}
					</div>
				</main>
				<div>
					<h3 className="mb-2">Members</h3>
					<MemberList members={room.members ?? []} onAction={handleAction}></MemberList>
				</div>
			</div>
		</>
	);
};
