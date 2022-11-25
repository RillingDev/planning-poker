package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
class RoomController {
	private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

	private final RoomRepository roomRepository;
	private final CardSetRepository cardSetRepository;
	private final RoomMemberRepository roomMemberRepository;
	private final UserRepository userRepository;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, RoomMemberRepository roomMemberRepository,
			UserRepository userRepository) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
		this.roomMemberRepository = roomMemberRepository;
		this.userRepository = userRepository;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	List<RoomJson> get() {
		return roomRepository.findAll().stream().map(RoomJson::convert).toList();
	}

	@PostMapping(value = "/api/rooms", consumes = MediaType.APPLICATION_JSON_VALUE)
	@Transactional
	ResponseEntity<String> create(@RequestBody RoomJson newRoom, @AuthenticationPrincipal UserDetails userDetails) {
		if (roomRepository.existsByName(newRoom.name())) {
			return ResponseEntity.badRequest().body("Already exists.");
		}

		// FIXME
		final User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

		final Optional<CardSet> cardSetOptional = cardSetRepository.findByName(newRoom.cardSetName());
		if (cardSetOptional.isEmpty()) {
			return ResponseEntity.badRequest().body("Card-set does not exist.");
		}
		final CardSet cardSet = cardSetOptional.get();

		final Room room = new Room(newRoom.name(), cardSet);
		roomRepository.save(room);

		final RoomMember roomMember = new RoomMember(room, user, RoomMember.Role.MODERATOR);
		roomMemberRepository.save(roomMember);

		logger.info("Created room '{}' by user '{}'.", room, null);
		return ResponseEntity.accepted().body("Created room.");
	}

	private record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName) {
		static RoomJson convert(Room room) {
			return new RoomJson(room.getName(), room.getCardSet().getName());
		}
	}
}
