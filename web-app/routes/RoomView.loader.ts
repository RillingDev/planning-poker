import { LoaderFunctionArgs } from "react-router-dom";
import { getRoom, getSummary, joinRoom } from "../api.ts";
import { Room, SummaryResult } from "../model.ts";

export interface RoomLoaderResult {
  room: Room;
  summaryResult: SummaryResult | null;
}

export async function roomLoader(
  args: LoaderFunctionArgs,
): Promise<RoomLoaderResult> {
  const roomName = args.params.roomName!;

  await joinRoom(roomName);

  const room = await getRoom(roomName);

  let summaryResult = null;
  if (room.votingClosed) {
    summaryResult = await getSummary(room.name);
  }

  return { room, summaryResult };
}
