package dev.rilling.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.rilling.planningpoker.data.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.Nullable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
class RoomController extends AbstractRoomAwareController {
	private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

	private final CardSetRepository cardSetRepository;
	private final ExtensionRepository extensionRepository;
	private final RoomService roomService;

	RoomController(RoomRepository roomRepository, CardSetRepository cardSetRepository, ExtensionRepository extensionRepository,
			RoomService roomService) {
		super(roomRepository);
		this.cardSetRepository = cardSetRepository;
		this.extensionRepository = extensionRepository;
		this.roomService = roomService;
	}

	@GetMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<RoomJson> getRooms() {
		return roomRepository.findAll().stream().sorted(Room.ALPHABETIC_COMPARATOR).map(RoomJson::convertToBasic).toList();
	}

	@PostMapping(value = "/api/rooms/{room-name}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void createRoom(@PathVariable("room-name") String roomName, @RequestBody RoomCreationOptionsJson roomOptions,
			@AuthenticationPrincipal OidcUser user) {
		if (roomRepository.findByName(roomName).isPresent()) {
			throw new RoomNameExistsException();
		}

		final CardSet cardSet = cardSetRepository.findByName(roomOptions.cardSetName).orElseThrow(CardSetNotFoundException::new);

		final Room room = new Room(roomName, cardSet);
		roomRepository.save(room);
		logger.info("Created room '{}' by user '{}'.", room, user.getName());
	}

	record RoomCreationOptionsJson(@JsonProperty(value = "cardSetName", required = true) String cardSetName) {
	}

	@GetMapping(value = "/api/rooms/{room-name}/", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public RoomJson getRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		final RoomMember roomMember = requireActingUserMember(room, user.getName());

		// Only show the own vote while voting is not complete
		return RoomJson.convertToDetailed(room, rm -> room.getVotingState() == Room.VotingState.CLOSED || rm.equals(roomMember));
	}

	@DeleteMapping(value = "/api/rooms/{room-name}")
	public void deleteRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);

		roomRepository.delete(room);
		logger.info("Deleted room '{}' by user '{}'.", room, user.getName());
	}

	@PatchMapping(value = "/api/rooms/{room-name}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void editRoom(@PathVariable("room-name") String roomName, @RequestBody RoomEditOptionsJson changes,
			@AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);

		if (changes.topic != null) {
			roomService.editTopic(room, changes.topic);
			logger.info("Edited room '{}' topic by user '{}'.", room, user.getName());
		}
		if (changes.cardSetName != null) {
			roomService.editCardSet(room, cardSetRepository.findByName(changes.cardSetName).orElseThrow(CardSetNotFoundException::new));
			logger.info("Edited room '{}' card set by user '{}'.", room, user.getName());
		}
		if (changes.extensionKeys != null) {
			final Set<Extension> newExtensions = changes.extensionKeys.stream()
					.map(newExtensionKey -> extensionRepository.findByKeyAndEnabledIsTrue(newExtensionKey)
							.orElseThrow(ExtensionNotFoundException::new))
					.collect(Collectors.toUnmodifiableSet());
			roomService.editExtensions(room, newExtensions);
			logger.info("Edited room '{}' extensions by user '{}'.", room, user.getName());
		}
		roomRepository.save(room);
	}

	record RoomEditOptionsJson(@Nullable @JsonProperty("cardSetName") String cardSetName, @Nullable @JsonProperty("topic") String topic,
							   @Nullable @JsonProperty("extensions") Set<String> extensionKeys) {

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

}
