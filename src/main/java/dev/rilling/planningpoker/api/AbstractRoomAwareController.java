package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.Room;
import dev.rilling.planningpoker.data.RoomMember;
import dev.rilling.planningpoker.data.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// TODO: use spring security for member check
public abstract class AbstractRoomAwareController {

	protected final RoomRepository roomRepository;

	protected AbstractRoomAwareController(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}

	/**
	 * Resolves room for this name, throwing if not found.
	 */
	// TODO: maybe use DataBinder instead of manual invocation?
	protected Room requireRoom(String roomName) {
		return roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No room with this name was found.")
	static class RoomNotFoundException extends RuntimeException {
	}

	/**
	 * Resolves user member for this name in this room, throwing if not found.
	 */
	protected RoomMember requireActingUserMember(Room room, String username) {
		return room.findMemberByUser(username).orElseThrow(NotAMemberException::new);
	}

	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "You are not a member of this room.")
	public static class NotAMemberException extends RuntimeException {
	}
}
