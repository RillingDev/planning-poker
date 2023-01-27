package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.exception.NotAMemberException;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.data.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Adding and removing extensions from rooms.
 */
@RestController
class RoomExtensionController {
	private static final Logger logger = LoggerFactory.getLogger(RoomExtensionController.class);

	private final RoomRepository roomRepository;
	private final ExtensionRepository extensionRepository;

	RoomExtensionController(RoomRepository roomRepository, ExtensionRepository extensionRepository) {
		this.roomRepository = roomRepository;
		this.extensionRepository = extensionRepository;
	}

	@PostMapping(value = "/api/rooms/{room-name}/extensions/{extension-key}")
	public void addExtension(@PathVariable("room-name") String roomName, @PathVariable("extension-key") String extensionKey,
			@AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final Extension extension = extensionRepository.findByKey(extensionKey).orElseThrow(ExtensionNotFoundException::new);

		if (room.getExtensionConfigs().stream().anyMatch(roomExtensionConfig -> roomExtensionConfig.getExtension().equals(extension))) {
			logger.warn("Extension '{}' is already in room '{}'.", extension, room);
			return;
		}

		if (!extension.isEnabled()) {
			logger.warn("Adding disabled extension '{}', it will not be available.", extension);
		}

		room.getExtensionConfigs().add(new RoomExtensionConfig(extension));
		roomRepository.save(room);
		logger.info("Extension '{}' added to room '{}'.", extension, room);
	}

	@DeleteMapping(value = "/api/rooms/{room-name}/extensions/{extension-key}")
	public void removeExtension(@PathVariable("room-name") String roomName, @PathVariable("extension-key") String extensionKey,
			@AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);
		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final Extension extension = extensionRepository.findByKey(extensionKey).orElseThrow(ExtensionNotFoundException::new);

		room.getExtensionConfigs()
				.stream()
				.filter(roomExtensionConfig -> roomExtensionConfig.getExtension().equals(extension))
				.findFirst()
				.ifPresentOrElse(roomExtensionConfig -> {
					room.getExtensionConfigs().remove(roomExtensionConfig);
					roomRepository.save(room);
					logger.info("Extension '{}' removed from room '{}'.", extension, room);
				}, () -> logger.warn("Extension '{}' is not in room '{}'.", extension, room));
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such extension.")
	private static class ExtensionNotFoundException extends RuntimeException {
	}

}
