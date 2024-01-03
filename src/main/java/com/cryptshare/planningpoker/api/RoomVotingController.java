package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.SummaryService;
import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.RoomRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.Nullable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
class RoomVotingController extends AbstractRoomAwareController {
	private static final Logger logger = LoggerFactory.getLogger(RoomVotingController.class);

	private final SummaryService summaryService;
	private final RoomService roomService;

	RoomVotingController(RoomRepository roomRepository, SummaryService summaryService, RoomService roomService) {
		super(roomRepository);
		this.summaryService = summaryService;
		this.roomService = roomService;
	}

	@PostMapping(value = "/api/rooms/{room-name}/votes")
	public void createVote(@PathVariable("room-name") String roomName, @RequestParam("card-name") String cardName,
						   @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		final RoomMember roomMember = requireActingUserMember(room, user.getName());
		if (roomMember.getRole() == RoomMember.Role.OBSERVER) {
			throw new ObserverException();
		}

		if (room.getVotingState() == Room.VotingState.CLOSED) {
			// May happen when clicking fast, so don't throw an error.
			logger.warn("Ignoring user '{}' voting in '{}' as voting is completed.", user.getName(), room);
			return;
		}

		final Card card = room.getCardSet()
				.getCards()
				.stream()
				.filter(c -> c.getName().equals(cardName))
				.findFirst()
				.orElseThrow(CardNotFoundException::new);

		roomService.setVote(room, roomMember, card);
		roomRepository.save(room);
		logger.debug("User '{}' voted with '{}' in '{}'.", user.getName(), card, room);
	}


	@DeleteMapping(value = "/api/rooms/{room-name}/votes")
	public void clearVotes(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		requireActingUserMember(room, user.getName());

		roomService.clearVotes(room);
		roomRepository.save(room);
		logger.debug("User '{}' cleared votes in '{}'.", user.getName(), room);
	}

	@GetMapping(value = "/api/rooms/{room-name}/votes/summary", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public SummaryResultJson getSummary(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = requireRoom(roomName);
		requireActingUserMember(room, user.getName());

		return new SummaryResultJson(summaryService.summarize(room).map(VoteSummaryJson::convert).orElse(null));
	}

	private record SummaryResultJson(@JsonProperty("votes") @Nullable VoteSummaryJson voteSummaryJson) {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card in this rooms card-set.")
	private static class CardNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Observers may not create votes.")
	private static class ObserverException extends RuntimeException {
	}

}
