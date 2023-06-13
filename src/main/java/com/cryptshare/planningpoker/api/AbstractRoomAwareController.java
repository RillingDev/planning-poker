package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public abstract class AbstractRoomAwareController {

	protected final RoomRepository roomRepository;

	protected AbstractRoomAwareController(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}


	/**
	 * Resolves room for this name, throwing if not found.
	 */
	protected Room requireRoom(String roomName) {
		return roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No such room.")
	static class RoomNotFoundException extends RuntimeException {
	}

	/**
	 * Resolves user member for this name in this room, throwing if not found.
	 */
	protected RoomMember requireActingUserMember(Room room, String username) {
		return room.findMemberByUser(username).orElseThrow(NotAMemberException::new);
	}

	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "You must be a member of this room to perform this action.")
	public static class NotAMemberException extends RuntimeException {
	}
}
