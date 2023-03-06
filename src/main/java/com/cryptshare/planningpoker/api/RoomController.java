package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.exception.NotAMemberException;
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
	private final ExtensionRepository extensionRepository;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, ExtensionRepository extensionRepository) {
		this.roomRepository = roomRepository;
		this.cardSetRepository = cardSetRepository;
		this.extensionRepository = extensionRepository;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<RoomJson> getRooms() {
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

	@GetMapping(value = "/api/rooms/{room-name}/", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public RoomJson getRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final RoomMember roomMember = room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		// Only show own vote while voting is not complete
		return RoomJson.convertToDetailed(room, rm -> room.getVotingState() == Room.VotingState.CLOSED || rm.equals(roomMember));
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
		if (roomOptions.extensionKeys != null) {
			applyExtensions(room, roomOptions.extensionKeys);
		}
		roomRepository.save(room);
		logger.info("Edited room '{}' by user '{}'.", room, user.getUsername());
	}

	private record RoomEditOptionsJson(@JsonProperty("cardSetName") String cardSetName, @Nullable @JsonProperty("topic") String topic,
									   @JsonProperty("extensions") Set<String> extensionKeys) {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card-set.")
	private static class CardSetNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such extension.")
	private static class ExtensionNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "A room with this name exists.")
	private static class RoomNameExistsException extends RuntimeException {
	}

	private void applyExtensions(Room room, Set<String> newExtensionKeys) {
		final Set<String> previousExtensionKeys = room.getExtensionConfigs()
				.stream()
				.map(RoomExtensionConfig::getExtension)
				.map(Extension::getKey)
				.collect(Collectors.toCollection(HashSet::new));

		for (String newExtensionKey : newExtensionKeys) {
			final Extension extension = extensionRepository.findByKeyAndEnabledIsTrue(newExtensionKey)
					.orElseThrow(ExtensionNotFoundException::new);

			if (previousExtensionKeys.contains(newExtensionKey)) {
				// Extension unchanged.
			} else {
				// Extension added.
				room.getExtensionConfigs().add(new RoomExtensionConfig(extension));
				logger.info("Extension '{}' added to room '{}'.", newExtensionKey, room);
			}
			previousExtensionKeys.remove(newExtensionKey);
		}

		// Check values that were only in previous, not in new one.
		for (String previousExtensionKey : previousExtensionKeys) {
			// Extension removed.
			room.getExtensionConfigs().removeIf(roomExtensionConfig -> roomExtensionConfig.getExtension().getKey().equals(previousExtensionKey));
			logger.info("Extension '{}' removed from room '{}'.", previousExtensionKey, room);
		}

	}
}
