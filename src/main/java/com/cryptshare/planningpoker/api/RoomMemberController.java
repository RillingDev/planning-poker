package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.exception.NotAMemberException;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;

@RestController
class RoomMemberController {
	private static final Logger logger = LoggerFactory.getLogger(RoomMemberController.class);

	private static final Comparator<RoomMember> MEMBER_COMPARATOR = Comparator.comparing(RoomMember::getUsername);

	private final RoomRepository roomRepository;

	RoomMemberController(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}

	@PostMapping(value = "/api/rooms/{room-name}/members")
	@Transactional
	void joinRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		if (room.findMemberByUser(user.getUsername()).isPresent()) {
			logger.debug("User '{}' is already in room '{}'.", user, room);
			return;
		}

		room.getMembers().add(new RoomMember(user.getUsername()));
		roomRepository.save(room);
		logger.info("User '{}' joined room '{}'.", user, room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/members")
	@Transactional
	void leaveRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).ifPresentOrElse(roomMember -> {
			room.getMembers().remove(roomMember);
			roomRepository.save(room);
			logger.info("User '{}' left room '{}'.", user, room);
		}, () -> logger.debug("User '{}' is not part of room '{}'.", user, room));
	}

	@PatchMapping(value = "/api/rooms/{room-name}/members/{member-username}")
	@Transactional
	@ResponseBody
	void editMember(@PathVariable("room-name") String roomName, @PathVariable("member-username") String memberUsername,
			@RequestParam("action") String actionName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final RoomMember targetMember = room.findMemberByUser(memberUsername).orElseThrow(MemberNotFoundException::new);

		final EditAction editAction = EditAction.valueOf(actionName);

		switch (editAction) {
			case SET_VOTER -> {
				targetMember.setRole(RoomMember.Role.VOTER);
			}
			case SET_OBSERVER -> {
				targetMember.setRole(RoomMember.Role.OBSERVER);
			}
			case KICK -> {
				room.getMembers().remove(targetMember);
			}
		}
		roomRepository.save(room);
	}

	enum EditAction {
		SET_VOTER,
		SET_OBSERVER,
		KICK
	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No member with this username was found.")
	private static class MemberNotFoundException extends RuntimeException {
	}

}
