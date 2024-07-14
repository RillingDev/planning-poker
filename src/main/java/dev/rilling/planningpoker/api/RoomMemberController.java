package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.Room;
import dev.rilling.planningpoker.data.RoomMember;
import dev.rilling.planningpoker.data.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
class RoomMemberController extends AbstractRoomAwareController {
	private static final Logger logger = LoggerFactory.getLogger(RoomMemberController.class);

	private final RoomService roomService;

	protected RoomMemberController(RoomRepository roomRepository, RoomService roomService) {
		super(roomRepository);
		this.roomService = roomService;
	}

	@PostMapping(value = "/api/rooms/{room-name}/members")
	public void joinRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		if (room.findMemberByUser(user.getName()).isPresent()) {
			logger.debug("User '{}' is already in room '{}'.", user.getName(), room);
			return;
		}

		roomService.addMember(room, new RoomMember(user.getName()));
		roomRepository.save(room);
		logger.info("User '{}' joined room '{}'.", user.getName(), room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/members")
	public void leaveRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		room.findMemberByUser(user.getName()).ifPresentOrElse(roomMember -> {
			roomService.removeMember(room, roomMember);
			roomRepository.save(room);
			logger.info("User '{}' left room '{}'.", user.getName(), room);
		}, () -> logger.debug("User '{}' is not part of room '{}'.", user.getName(), room));
	}

	@PatchMapping(value = "/api/rooms/{room-name}/members/{member-username}")
	@ResponseBody
	public void editMember(@PathVariable("room-name") String roomName, @PathVariable("member-username") String memberUsername,
			@RequestParam("action") EditAction action, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		final RoomMember actingMember = requireActingUserMember(room, user.getName());

		final RoomMember targetMember = room.findMemberByUser(memberUsername).orElseThrow(MemberNotFoundException::new);

		switch (action) {
			case SET_VOTER -> {
				if (targetMember.getRole() == RoomMember.Role.VOTER) {
					logger.warn("Member '{}' already has the role voter in '{}'.", actingMember, room);
					return;
				}
				roomService.setRole(room, targetMember, RoomMember.Role.VOTER);
				roomRepository.save(room);
				logger.info("Member '{}' set '{}' to voter in '{}'.", actingMember, targetMember, room);
			}
			case SET_OBSERVER -> {
				if (targetMember.getRole() == RoomMember.Role.OBSERVER) {
					logger.warn("Member '{}' already has the role observer in '{}'.", actingMember, room);
					return;
				}
				roomService.setRole(room, targetMember, RoomMember.Role.OBSERVER);
				roomRepository.save(room);
				logger.info("Member '{}' set '{}' to observer in '{}'.", actingMember, targetMember, room);
			}
			case KICK -> {
				roomService.removeMember(room, targetMember);
				roomRepository.save(room);
				logger.info("Member '{}' kicked '{}' from '{}'.", actingMember, targetMember, room);
			}
		}
	}

	enum EditAction {
		SET_VOTER, SET_OBSERVER, KICK
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No member with this username was found.")
	private static class MemberNotFoundException extends RuntimeException {
	}

}
