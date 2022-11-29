import { LoaderFunctionArgs, useLoaderData } from "react-router";
import type { FC } from "react";
import { Link } from "react-router-dom";
import "./RoomView.css";
import type { Room } from "../api";
import { getRoom, joinRoom, leaveRoom } from "../api";
import { MemberList } from "../components/MemberList";

interface LoaderResult {
	room: Room;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderResult> {
	const roomName = args.params.roomName as string;
	await joinRoom(roomName);
	const room = await getRoom(roomName);
	return {room};
}

export const RoomView: FC = () => {
	const {room} = useLoaderData() as LoaderResult;

	const handleLeave = () => {
		leaveRoom(room.name).catch(console.error);
	};

	return (
		<>
			<nav>
				<Link to={"/"} className="btn btn-primary" onClick={() => handleLeave()}>Back</Link>
			</nav>
			<header>
				<h2>{room.name}</h2>
			</header>
			<main>
				<MemberList members={room?.members ?? []}></MemberList>
			</main>
		</>
	);
};
