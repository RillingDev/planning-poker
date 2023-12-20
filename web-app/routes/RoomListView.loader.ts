import { Room } from "../model.ts";
import { getRooms } from "../api.ts";

export interface RoomListLoaderResult {
  rooms: Room[];
}

export async function roomListLoader(): Promise<RoomListLoaderResult> {
  const rooms = await getRooms();
  return { rooms };
}
