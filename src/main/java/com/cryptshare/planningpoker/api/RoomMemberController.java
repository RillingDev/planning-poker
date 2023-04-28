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
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
class RoomMemberController {
	private static final Logger logger = LoggerFactory.getLogger(RoomMemberController.class);

	private final RoomRepository roomRepository;

	RoomMemberController(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}

	@PostMapping(value = "/api/rooms/{room-name}/members")
	public void joinRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		if (room.findMemberByUser(user.getPreferredUsername()).isPresent()) {
			logger.debug("User '{}' is already in room '{}'.", user.getPreferredUsername(), room);
			return;
		}

		addMember(room, user.getPreferredUsername());
		roomRepository.save(room);
		logger.info("User '{}' joined room '{}'.", user.getPreferredUsername(), room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/members")
	public void leaveRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getPreferredUsername()).ifPresentOrElse(roomMember -> {
			removeMember(room, roomMember);
			roomRepository.save(room);
			logger.info("User '{}' left room '{}'.", user.getPreferredUsername(), room);
		}, () -> logger.debug("User '{}' is not part of room '{}'.", user.getPreferredUsername(), room));
	}

	@PatchMapping(value = "/api/rooms/{room-name}/members/{member-username}")
	@ResponseBody
	public void editMember(@PathVariable("room-name") String roomName, @PathVariable("member-username") String memberUsername,
			@RequestParam("action") EditAction action, @AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final RoomMember actingMember = room.findMemberByUser(user.getPreferredUsername()).orElseThrow(NotAMemberException::new);

		final RoomMember targetMember = room.findMemberByUser(memberUsername).orElseThrow(MemberNotFoundException::new);

		switch (action) {
			case SET_VOTER -> {
				if (targetMember.getRole() == RoomMember.Role.VOTER) {
					logger.warn("Member '{}' already has the role voter in '{}'.", actingMember, room);
					return;
				}
				setRole(room, targetMember, RoomMember.Role.VOTER);
				roomRepository.save(room);
				logger.info("Member '{}' set '{}' to voter in '{}'.", actingMember, targetMember, room);
			}
			case SET_OBSERVER -> {
				if (targetMember.getRole() == RoomMember.Role.OBSERVER) {
					logger.warn("Member '{}' already has the role observer in '{}'.", actingMember, room);
					return;
				}
				setRole(room, targetMember, RoomMember.Role.OBSERVER);
				roomRepository.save(room);
				logger.info("Member '{}' set '{}' to observer in '{}'.", actingMember, targetMember, room);
			}
			case KICK -> {
				removeMember(room, targetMember);
				roomRepository.save(room);
				logger.info("Member '{}' kicked '{}' from '{}'.", actingMember, targetMember, room);
			}
		}
	}

	enum EditAction {
		SET_VOTER,
		SET_OBSERVER,
		KICK
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No member with this username was found.")
	private static class MemberNotFoundException extends RuntimeException {
	}

	private static void setRole(Room room, RoomMember roomMember, RoomMember.Role role) {
		roomMember.setRole(role);

		if (role == RoomMember.Role.OBSERVER && room.allVotersVoted()) {
			room.setVotingState(Room.VotingState.CLOSED);
		}
	}

	private static void addMember(Room room, String username) {
		room.getMembers().add(new RoomMember(username));
	}

	private static void removeMember(Room room, RoomMember roomMember) {
		room.getMembers().remove(roomMember);

		if (room.allVotersVoted()) {
			room.setVotingState(Room.VotingState.CLOSED);
		}
	}
}
