package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.CardSet;
import com.cryptshare.planningpoker.entities.CardSetRepository;
import com.cryptshare.planningpoker.entities.Room;
import com.cryptshare.planningpoker.entities.RoomRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
	List<RoomJson> get() {
		return roomRepository.findAll().stream().map(RoomJson::convert).toList();
	}

	// TODO: add auth and add user as member
	@PostMapping(value = "/api/rooms", consumes = MediaType.APPLICATION_JSON_VALUE)
	@Transactional
	ResponseEntity<String> create(@RequestBody RoomJson newRoom) {
		if (roomRepository.existsByName(newRoom.name())) {
			return ResponseEntity.badRequest().body("Already exists.");
		}

		final Optional<CardSet> cardSetOptional = cardSetRepository.findByName(newRoom.cardSetName());
		if (cardSetOptional.isEmpty()) {
			return ResponseEntity.badRequest().body("Card-set does not exist.");
		}
		final CardSet cardSet = cardSetOptional.get();

		final Room room = new Room(newRoom.name(), cardSet);
		roomRepository.save(room);
		logger.info("Created room '{}'.", room);
		return ResponseEntity.accepted().body("Created room.");
	}

	private record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName) {
		static RoomJson convert(Room room) {
			return new RoomJson(room.getName(), room.getCardSet().getName());
		}
	}
}
