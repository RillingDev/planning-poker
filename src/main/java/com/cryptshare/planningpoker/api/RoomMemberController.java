package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.UserService;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.RoomRepository;
import com.cryptshare.planningpoker.data.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;

@RestController
class RoomMemberController {
	private static final Logger logger = LoggerFactory.getLogger(RoomMemberController.class);

	private static final Comparator<RoomMember> MEMBER_COMPARATOR = Comparator.comparing(roomMember -> roomMember.getUser().getUsername());

	private final RoomRepository roomRepository;
	private final UserService userService;

	RoomMemberController(RoomRepository roomRepository, UserService userService) {
		this.roomRepository = roomRepository;
		this.userService = userService;
	}

	@PostMapping(value = "/api/rooms/{room-name}/session")
	@Transactional
	void joinRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		final User user = userService.getUser(userDetails);

		if (room.getMembers().stream().anyMatch(roomMember -> roomMember.getUser().equals(user))) {
			logger.debug("User '{}' is already in room '{}'.", user, room);
			return;
		}

		room.getMembers().add(new RoomMember(user, RoomMember.Role.USER));
		roomRepository.save(room);
		logger.info("User '{}' joined room '{}'.", user, room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/session")
	@Transactional
	void leaveRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		final User user = userService.getUser(userDetails);

		room.getMembers().stream().filter(roomMember -> roomMember.getUser().equals(user)).findFirst().ifPresentOrElse(roomMember -> {
			room.getMembers().remove(roomMember);
			roomRepository.save(room);
			logger.info("User '{}' left room '{}'.", user, room);
		}, () -> logger.debug("User '{}' is not part of room '{}'.", user, room));

	}
}
