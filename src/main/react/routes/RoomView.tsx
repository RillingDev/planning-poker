import type { FC } from "react";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import type { Card, EditAction, Room, RoomMember, User, VoteSummary } from "../api";
import { clearVotes, createVote, editMember, getRoom, getSummary, joinRoom, leaveRoom } from "../api";
import { AppContext } from "../AppContext";
import { CardList } from "../components/CardList";
import { ErrorPanel } from "../components/ErrorPanel";
import { MemberList } from "../components/MemberList";
import { Summary } from "../components/Summary";
import { useErrorHandler, useInterval } from "../hooks";
import "./RoomView.css";

interface LoaderResult {
	room: Room;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderResult> {
	const roomName = args.params.roomName as string;
	await joinRoom(roomName);
	const room = await getRoom(roomName);
	return {room};
}

const findMemberForUser = (room: Room, user: User): RoomMember | null => room.members.find(member => member.username == user.username) ?? null;

export const RoomView: FC = () => {
	const [error, handleError, resetError] = useErrorHandler();

	const {user} = useContext(AppContext);
	const loaderData = useLoaderData() as LoaderResult;
	const [room, setRoom] = useState<Room>(loaderData.room);

	const [activeCard, setActiveCard] = useState<Card | null>(null);

	const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);

	const handleLeave = () => {
		leaveRoom(room.name).catch(handleError);
	};

	const updateRoom = async () => {
		const loadedRoom = await getRoom(room.name);
		setRoom(loadedRoom);

		if (loadedRoom.votingComplete) {
			setVoteSummary(await getSummary(room.name));
		} else {
			setVoteSummary(null);
			setActiveCard(findMemberForUser(loadedRoom, user)!.vote);
		}
	};

	useInterval(() => {
		updateRoom().catch(handleError);
	}, 1500); // Poll for other votes

	const handleCardClick = (card: Card) => {
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
					<h3>Vote</h3>
					{voteSummary != null ? <Summary voteSummary={voteSummary}></Summary> : <CardList cardSet={room?.cardSet ?? {
						name: "None",
						cards: []
					}} activeCard={activeCard} onClick={handleCardClick}></CardList>}
					<Button variant="warning" onClick={handleRestart}>Restart</Button>
				</div>
				<div>
					<h3>Members</h3>
					<MemberList members={room?.members ?? []} onAction={handleAction}></MemberList>
				</div>
			</main>
		</>
	);
};
