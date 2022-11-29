package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.UserService;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.RoomJson;
import com.cryptshare.planningpoker.api.projection.RoomMemberJson;
import com.cryptshare.planningpoker.data.*;
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

		if (room.findMemberByUser(user).isPresent()) {
			logger.debug("User '{}' is already in room '{}'.", user, room);
			return;
		}

		room.getMembers().add(new RoomMember(user, RoomMember.Role.VOTER));
		roomRepository.save(room);
		logger.info("User '{}' joined room '{}'.", user, room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/session")
	@Transactional
	void leaveRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		final User user = userService.getUser(userDetails);

		room.findMemberByUser(user).ifPresentOrElse(roomMember -> {
			room.getMembers().remove(roomMember);
			roomRepository.save(room);
			logger.info("User '{}' left room '{}'.", user, room);
		}, () -> logger.debug("User '{}' is not part of room '{}'.", user, room));
	}

	@GetMapping(value = "/api/rooms/{room-name}/session")
	@Transactional
	@ResponseBody
	RoomJson getRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		final User user = userService.getUser(userDetails);

		room.findMemberByUser(user).orElseThrow(NotAMemberException::new);

		return RoomJson.convert(room, roomMember -> RoomMemberJson.convertToDetailed(roomMember, !room.isVotingComplete()));
	}

	@PostMapping(value = "/api/rooms/{room-name}/session/vote")
	@Transactional
	void createVote(@PathVariable("room-name") String roomName, @RequestParam("card-name") String cardName,
			@AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		final User user = userService.getUser(userDetails);

		final RoomMember roomMember = room.findMemberByUser(user).orElseThrow(NotAMemberException::new);

		final Card card = room.getCardSet()
				.getCards()
				.stream()
				.filter(c -> c.getName().equals(cardName))
				.findFirst()
				.orElseThrow(CardNotFoundException::new);

		roomMember.setVote(new Vote(roomMember, card));
		roomRepository.save(room);
		logger.info("User '{}' voted with '{}'.", user, card);
	}

	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "You must be a member of this room to perform this action.")
	private static class NotAMemberException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card in this rooms card-set.")
	private static class CardNotFoundException extends RuntimeException {
	}

}
