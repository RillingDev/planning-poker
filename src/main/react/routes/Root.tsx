import { Link, useLoaderData } from "react-router-dom";
import type { FC } from "react";
import { loadRooms, Room } from "../api";

export async function loader() {
	const rooms = await loadRooms();
	return {rooms};
}

export const Root: FC = () => {
	const {rooms} = useLoaderData() as { rooms: ReadonlyArray<Room> };
	return (
		<nav>
			<ul>
				{rooms.map(room => <Link to={`/rooms/${encodeURIComponent(room.name)}`} key={room.name}>{room.name}</Link>)}
			</ul>
		</nav>
	);
};