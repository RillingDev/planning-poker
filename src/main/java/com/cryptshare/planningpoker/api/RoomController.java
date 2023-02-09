package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.RoomJson;
import com.cryptshare.planningpoker.data.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.Nullable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
	public void createRoom(@PathVariable("room-name") String roomName, @RequestBody RoomCreationOptionsJson roomOptions,
			@AuthenticationPrincipal UserDetails user) {
		if (roomRepository.findByName(roomName).isPresent()) {
			throw new RoomNameExistsException();
		}

		final CardSet cardSet = cardSetRepository.findByName(roomOptions.cardSetName).orElseThrow(CardSetNotFoundException::new);

		final Room room = new Room(roomName, cardSet);
		roomRepository.save(room);
		logger.info("Created room '{}' by user '{}'.", room, user.getUsername());
	}

	private record RoomCreationOptionsJson(@JsonProperty(value = "cardSetName", required = true) String cardSetName) {
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	public void deleteRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		roomRepository.delete(room);
		logger.info("Deleted room '{}' by user '{}'.", room, user.getUsername());
	}

	@PatchMapping(value = "/api/rooms/{room-name}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void editRoom(@PathVariable("room-name") String roomName, @RequestBody RoomEditOptionsJson roomOptions,
			@AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		if (roomOptions.topic != null) {
			room.setTopic(roomOptions.topic);
		}
		if (roomOptions.cardSetName != null) {
			room.setCardSet(cardSetRepository.findByName(roomOptions.cardSetName).orElseThrow(CardSetNotFoundException::new));
		}
		roomRepository.save(room);
		logger.info("Edited room '{}' by user '{}'.", room, user.getUsername());
	}

	private record RoomEditOptionsJson(@JsonProperty("cardSetName") String cardSetName, @Nullable @JsonProperty("topic") String topic,
									   @JsonProperty("extensions") List<String> extensionKeys) {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card-set.")
	private static class CardSetNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "A room with this name exists.")
	private static class RoomNameExistsException extends RuntimeException {
	}

	private record RoomOptionsJson(@JsonProperty("cardSetName") String cardSetName, @Nullable @JsonProperty("topic") String topic,
								   @JsonProperty("extensions") List<String> extensions) {
	}
}
