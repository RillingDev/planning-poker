package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
class RoomController {
	private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

	private static final Comparator<RoomMember> MEMBER_COMPARATOR = Comparator.comparing(roomMember -> roomMember.getUser()
			.getUsername());

	private final RoomRepository roomRepository;
	private final CardSetRepository cardSetRepository;
	private final UserService userService;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, UserService userService) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
		this.userService = userService;
	}

	private static void assertModeratorPermissions(Room room, User user) {
		if (room.getMembers()
				.stream()
				.noneMatch(roomMember -> roomMember.getUser().equals(user) &&
						roomMember.getRole() == RoomMember.Role.MODERATOR)) {
			throw new NotModeratorException();
		}
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	List<RoomJson> loadRooms() {
		return roomRepository.findAll().stream().map(RoomJson::convert).toList();
	}

	@PostMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void createRoom(@PathVariable("room-name") String roomName,
					@RequestParam("card-set-name") String cardSetName,
					@AuthenticationPrincipal UserDetails userDetails) {
		if (roomRepository.findByName(roomName).isPresent()) {
			throw new RoomNameExistsException();
		}

		final User user = userService.getUser(userDetails);

		final CardSet cardSet = cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new);

		final Room room = new Room(roomName, cardSet);
		room.getMembers().add(new RoomMember(user, RoomMember.Role.MODERATOR));
		roomRepository.save(room);

		logger.info("Created room '{}' by user '{}'.", room, user);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void deleteRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final User user = userService.getUser(userDetails);
		assertModeratorPermissions(room, user);

		roomRepository.delete(room);

		logger.info("Deleted room '{}' by user '{}'.", room, user);
	}

	@PatchMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void deleteRoom(@PathVariable("room-name") String roomName,
					@RequestParam("card-set-name") String cardSetName,
					@AuthenticationPrincipal UserDetails userDetails) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final User user = userService.getUser(userDetails);
		assertModeratorPermissions(room, user);

		room.setCardSet(cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new));
		roomRepository.save(room);

		logger.info("Edited room '{}' by user '{}'.", room, user);
	}

	private record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName,
							@JsonProperty("members") List<RoomMemberJson> isModerator) {
		static RoomJson convert(Room room) {
			return new RoomJson(room.getName(),
					room.getCardSet().getName(),
					room.getMembers().stream().sorted(MEMBER_COMPARATOR).map(RoomMemberJson::convert).toList());
		}
	}

	private record RoomMemberJson(@JsonProperty("username") String name, @JsonProperty("role") int role) {
		static RoomMemberJson convert(RoomMember roomMember) {
			return new RoomMemberJson(roomMember.getUser().getUsername(), roomMember.getRole().ordinal());
		}
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "A room with this name exists.")
	private static class RoomNameExistsException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No such room.")
	private static class RoomNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No such card-set.")
	private static class CardSetNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "You must be a moderator of this room to perform this action.")
	private static class NotModeratorException extends RuntimeException {
	}
}
