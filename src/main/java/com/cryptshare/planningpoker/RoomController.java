package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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
	private final UserRepository userRepository;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, UserRepository userRepository) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
		this.userRepository = userRepository;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	List<RoomJson> get() {
		return roomRepository.findAll().stream().map(RoomJson::convert).toList();
	}

	@PostMapping(value = "/api/rooms/{room-name}")
	@Transactional
	ResponseEntity<String> create(@PathVariable("room-name") String roomName, @RequestParam("card-set-name") String cardSetName,
			@AuthenticationPrincipal UserDetails userDetails) {
		if (roomRepository.findByName(roomName).isPresent()) {
			return ResponseEntity.badRequest().body("Already exists.");
		}

		final User user = getUser(userDetails);

		final Optional<CardSet> cardSetOptional = cardSetRepository.findByName(cardSetName);
		if (cardSetOptional.isEmpty()) {
			return ResponseEntity.badRequest().body("Card-set does not exist.");
		}
		final CardSet cardSet = cardSetOptional.get();

		final Room room = new Room(roomName, cardSet);
		room.getMembers().add(new RoomMember(user, RoomMember.Role.MODERATOR));
		roomRepository.save(room);

		logger.info("Created room '{}' by user '{}'.", room, user);
		return ResponseEntity.accepted().body("Created room.");
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	@Transactional
	ResponseEntity<String> delete(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails userDetails) {
		final Optional<Room> roomOpt = roomRepository.findByName(roomName);
		if (roomOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		final Room room = roomOpt.get();

		final User user = getUser(userDetails);

		if (room.getMembers()
				.stream()
				.noneMatch(roomMember -> roomMember.getUser().equals(user) && roomMember.getRole() == RoomMember.Role.MODERATOR)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only a moderator of this room may delete it.");
		}

		roomRepository.delete(room);

		logger.info("Deleted room '{}' by user '{}'.", room, user);
		return ResponseEntity.ok().body("Deleted room.");
	}

	private User getUser(UserDetails userDetails) {
		// TODO find more ergonomic way to load user
		return userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
	}

	private record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName) {
		static RoomJson convert(Room room) {
			return new RoomJson(room.getName(), room.getCardSet().getName());
		}
	}
}
