import { LoaderFunctionArgs, useLoaderData } from "react-router";
import type { FC } from "react";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./RoomView.css";
import type { Card, Room, RoomMember, User } from "../api";
import { createVote, getRoom, joinRoom, leaveRoom } from "../api";
import { MemberList } from "../components/MemberList";
import { CardList } from "../components/CardList";
import { AppContext } from "../AppContext";

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

const useInterval = (callback: () => void, timeout: number) => {
	useEffect(() => {
		const interval = setInterval(callback, timeout);
		return () => clearInterval(interval);
	}, [callback, timeout]);
};

export const RoomView: FC = () => {
	const handleError = console.error;

	const {user} = useContext(AppContext);
	const loaderData = useLoaderData() as LoaderResult;
	const [room, setRoom] = useState<Room>(loaderData.room);

	const handleLeave = () => {
		leaveRoom(room.name).catch(handleError);
	};

	const updateRoom = () => {
		getRoom(room.name).then(room => {
			setRoom(room);
			setActiveCard(findMemberForUser(room, user)!.vote);
		}).catch(handleError);
	};

	useInterval(updateRoom, 1500); // Poll for other votes

	const [activeCard, setActiveCard] = useState<Card | null>(null);
	const handleCardClick = (card: Card) => {
		createVote(room.name, card.name).then(updateRoom).catch(handleError);
	};

	return (
		<>
			<nav>
				<Link to={"/"} className="btn btn-primary" onClick={() => handleLeave()}>Back</Link>
			</nav>
			<header>
				<h2>{room.name}</h2>
			</header>
			<main className="room-view">
				<div>
					<h3>Vote</h3>
					<CardList cardSet={room?.cardSet ?? {name: "None", cards: []}} activeCard={activeCard} onClick={handleCardClick}></CardList>
				</div>
				<div>
					<h3>Members</h3>
					<MemberList members={room?.members ?? []}></MemberList>
				</div>
			</main>
		</>
	);
};
