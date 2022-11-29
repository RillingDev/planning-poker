package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.UserService;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.RoomJson;
import com.cryptshare.planningpoker.api.projection.RoomMemberJson;
import com.cryptshare.planningpoker.data.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
class RoomController {
	private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

	private final RoomRepository roomRepository;
	private final CardSetRepository cardSetRepository;
	private final UserService userService;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, UserService userService) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
		this.userService = userService;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	List<RoomJson> loadRooms() {
		return roomRepository.findAll().stream().map(room -> RoomJson.convert(room, RoomMemberJson::convertToBasic)).toList();
	}

	@PostMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void createRoom(@PathVariable("room-name") String roomName, @RequestParam("card-set-name") String cardSetName,
			@AuthenticationPrincipal UserDetails userDetails) {
		final User user = userService.getUser(userDetails);
		if (roomRepository.findByName(roomName).isPresent()) {
			throw new RoomNameExistsException();
		}

		final CardSet cardSet = cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new);

		final Room room = new Room(roomName, cardSet);
		room.getMembers().add(new RoomMember(user, RoomMember.Role.VOTER));
		roomRepository.save(room);
		logger.info("Created room '{}' by user '{}'.", room, user);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void deleteRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final User user = userService.getUser(userDetails);
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		roomRepository.delete(room);
		logger.info("Deleted room '{}' by user '{}'.", room, user);
	}

	@PatchMapping(value = "/api/rooms/{room-name}")
	@Transactional
	void editRoom(@PathVariable("room-name") String roomName, @RequestParam("card-set-name") String cardSetName,
			@AuthenticationPrincipal UserDetails userDetails) {
		final User user = userService.getUser(userDetails);
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.setCardSet(cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new));
		roomRepository.save(room);
		logger.info("Edited room '{}' by user '{}'.", room, user);
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card-set.")
	private static class CardSetNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "A room with this name exists.")
	private static class RoomNameExistsException extends RuntimeException {
	}

}
