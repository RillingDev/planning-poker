import type { FC } from "react";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import type { Card, EditAction, Room, RoomMember, User, VoteSummary } from "../api";
import { clearVotes, createVote, editMember, getRoom, getSummary, joinRoom, leaveRoom, Role } from "../api";
import { AppContext } from "../AppContext";
import { CardList } from "../components/CardList";
import { ErrorPanel } from "../components/ErrorPanel";
import { MemberList } from "../components/MemberList";
import { Summary } from "../components/Summary";
import { useErrorHandler, useInterval } from "../hooks";
import "./RoomView.css";

interface LoaderResult {
	room: Room;
	voteSummary: VoteSummary | null;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderResult> {
	const roomName = args.params.roomName as string;

	await joinRoom(roomName);

	const room = await getRoom(roomName);

	let voteSummary = null;
	if (room.votingComplete) {
		voteSummary = await getSummary(room.name);
	}

	return {room, voteSummary};
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

	const {user} = useContext(AppContext);
	const loaderData = useLoaderData() as LoaderResult;
	const [room, setRoom] = useState<Room>(loaderData.room);

	const [member, setMember] = useState<RoomMember>(findMemberForUser(room, user));
	const [activeCard, setActiveCard] = useState<Card | null>(member.vote);

	const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(loaderData.voteSummary);

	const updateRoom = async () => {
		const loadedRoom = await getRoom(room.name);
		setRoom(loadedRoom);
		const loadedMember = findMemberForUser(loadedRoom, user);
		setMember(loadedMember);
		setActiveCard(loadedMember.vote);

		if (loadedRoom.votingComplete) {
			if (voteSummary == null) {
				setVoteSummary(await getSummary(loadedRoom.name));
			}
		} else {
			setVoteSummary(null);
		}
	};

	useInterval(() => {
		updateRoom().catch(handleError);
	}, 1500); // Poll for other votes

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

			<nav>
				<Link to={"/"} className="btn btn-primary" onClick={() => handleLeave()}>Back</Link>
			</nav>
			<header>
				<h2>{room.name}</h2>
			</header>
			<main className="room-view">
				<div>
					<header className="d-flex justify-content-between align-items-center">
						<h3>Vote</h3>
						<Button variant="warning" onClick={handleRestart} size="sm">Restart</Button>
					</header>
					{voteSummary != null ?
						<Summary voteSummary={voteSummary}></Summary> :
						<CardList cardSet={room.cardSet} activeCard={activeCard} votingEnabled={member.role != Role.OBSERVER} onClick={handleCardClick}></CardList>
					}
				</div>
				<div>
					<h3>Members</h3>
					<MemberList members={room.members ?? []} onAction={handleAction}></MemberList>
				</div>
			</main>
		</>
	);
};
