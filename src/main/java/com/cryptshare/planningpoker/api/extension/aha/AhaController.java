package com.cryptshare.planningpoker.api.extension.aha;

import com.cryptshare.planningpoker.api.exception.NotAMemberException;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomExtensionConfig;
import com.cryptshare.planningpoker.data.RoomRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.Nullable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("extension:aha")
class AhaController {
	private static final Logger logger = LoggerFactory.getLogger(AhaController.class);

	private static final String ATTR_SCORE_FACT_NAME = "scoreFactName";

	private final RoomRepository roomRepository;
	private final AhaConfigJson ahaConfigJson;

	AhaController(RoomRepository roomRepository, Environment environment) {
		this.roomRepository = roomRepository;
		ahaConfigJson = new AhaConfigJson(
				environment.getRequiredProperty("planning-poker.extension.aha.account-domain"),
				environment.getRequiredProperty("planning-poker.extension.aha.client-id"),
				environment.getRequiredProperty("planning-poker.extension.aha.redirect-uri"));
	}

	@GetMapping(value = "/api/extensions/aha", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	AhaConfigJson getConfig() {
		return ahaConfigJson;
	}

	record AhaConfigJson(@JsonProperty("accountDomain") String accountDomain, @JsonProperty("clientId") String clientId,
						 @JsonProperty("redirectUri") String redirectUri) {
	}

	@GetMapping(value = "/api/rooms/{room-name}/extensions/aha", produces = MediaType.APPLICATION_JSON_VALUE)
	public AhaRoomConfigJson getRoomConfig(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final RoomExtensionConfig extensionConfig = getAhaExtensionConfig(room);

		return new AhaRoomConfigJson(extensionConfig.getAttributes().get(ATTR_SCORE_FACT_NAME));
	}

	@PatchMapping(value = "/api/rooms/{room-name}/extensions/aha", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void editRoomConfig(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user,
			@RequestBody AhaRoomConfigJson changes) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final RoomExtensionConfig extensionConfig = getAhaExtensionConfig(room);

		if (changes.scoreFactName() != null) {
			extensionConfig.getAttributes().put(ATTR_SCORE_FACT_NAME, changes.scoreFactName());
			roomRepository.save(room);
			logger.info("Set scoreFactName to '{}' in '{}'.", changes.scoreFactName(), room);
		}
	}

	record AhaRoomConfigJson(@JsonProperty("scoreFactName") @Nullable String scoreFactName) {

	}

	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Extension unavailable.")
	public class ExtensionUnavailableException extends RuntimeException {

	}

	private RoomExtensionConfig getAhaExtensionConfig(Room room) {
		// No need to check if extension is enabled. If it wasn't, this controller would not be active.
		return room.getExtensionConfigs()
				.stream()
				.filter(roomExtensionConfig -> roomExtensionConfig.getExtension().getKey().equals("aha"))
				.findFirst()
				.orElseThrow(ExtensionUnavailableException::new);
	}
}
