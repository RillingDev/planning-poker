package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.RoomJson;
import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.CardSetRepository;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.Nullable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
class RoomController {
	private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

	private final RoomRepository roomRepository;
	private final CardSetRepository cardSetRepository;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<RoomJson> loadRooms() {
		return roomRepository.findAll().stream().sorted(Room.ALPHABETIC_COMPARATOR).map(RoomJson::convertToBasic).toList();
	}

	@PostMapping(value = "/api/rooms/{room-name}")
	public void createRoom(@PathVariable("room-name") String roomName,
			@RequestParam(value = "room-topic", required = false) @Nullable String roomTopic, @RequestParam("card-set-name") String cardSetName,
			@AuthenticationPrincipal UserDetails user) {
		if (roomRepository.findByName(roomName).isPresent()) {
			throw new RoomNameExistsException();
		}

		final CardSet cardSet = cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new);

		final Room room = new Room(roomName, cardSet);
		room.setTopic(roomTopic);
		roomRepository.save(room);
		logger.info("Created room '{}' by user '{}'.", room, user.getUsername());
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	public void deleteRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		roomRepository.delete(room);
		logger.info("Deleted room '{}' by user '{}'.", room, user.getUsername());
	}

	@PatchMapping(value = "/api/rooms/{room-name}")
	public void editRoom(@PathVariable("room-name") String roomName,
			@RequestParam(value = "room-topic", required = false) @Nullable String roomTopic,
			@RequestParam(value = "card-set-name", required = false) String cardSetName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		if (roomTopic != null) {
			room.setTopic(roomTopic);
		}
		if (cardSetName != null) {
			room.setCardSet(cardSetRepository.findByName(cardSetName).orElseThrow(CardSetNotFoundException::new));
		}
		roomRepository.save(room);
		logger.info("Edited room '{}' by user '{}'.", room, user.getUsername());
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card-set.")
	private static class CardSetNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "A room with this name exists.")
	private static class RoomNameExistsException extends RuntimeException {
	}

}
