package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.SummaryService;
import com.cryptshare.planningpoker.api.exception.NotAMemberException;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.VoteSummaryJson;
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
class RoomVotingController {
	private static final Logger logger = LoggerFactory.getLogger(RoomVotingController.class);

	private final RoomRepository roomRepository;
	private final SummaryService summaryService;

	RoomVotingController(RoomRepository roomRepository, SummaryService summaryService) {
		this.roomRepository = roomRepository;
		this.summaryService = summaryService;
	}

	@PostMapping(value = "/api/rooms/{room-name}/votes")
	public void createVote(@PathVariable("room-name") String roomName, @RequestParam("card-name") String cardName,
			@AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final RoomMember roomMember = room.findMemberByUser(user.getPreferredUsername()).orElseThrow(NotAMemberException::new);
		if (roomMember.getRole() == RoomMember.Role.OBSERVER) {
			throw new ObserverException();
		}

		if (room.getVotingState() == Room.VotingState.CLOSED) {
			// May happen on accident, so dont throw an error.
			logger.warn("Ignoring user '{}' voting in '{}' as voting is completed.", user.getPreferredUsername(), room);
			return;
		}

		final Card card = room.getCardSet()
				.getCards()
				.stream()
				.filter(c -> c.getName().equals(cardName))
				.findFirst()
				.orElseThrow(CardNotFoundException::new);

		setVote(room, roomMember, card);
		roomRepository.save(room);
		logger.debug("User '{}' voted with '{}' in '{}'.", user.getPreferredUsername(), card, room);
	}

	// TODO: Move room and member lookup to argument resolver or similar.
	@DeleteMapping(value = "/api/rooms/{room-name}/votes")
	public void clearVotes(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getPreferredUsername()).orElseThrow(NotAMemberException::new);

		clearVotes(room);
		roomRepository.save(room);
		logger.debug("User '{}' cleared votes in '{}'.", user.getPreferredUsername(), room);
	}

	@GetMapping(value = "/api/rooms/{room-name}/votes/summary", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public SummaryResultJson getSummary(@PathVariable("room-name") String roomName, @AuthenticationPrincipal OidcUser user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getPreferredUsername()).orElseThrow(NotAMemberException::new);

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

	private static void setVote(Room room, RoomMember roomMember, Card card) {
		roomMember.setVote(card);

		if (room.allVotersVoted()) {
			room.setVotingState(Room.VotingState.CLOSED);
		}
	}

	private static void clearVotes(Room room) {
		room.getMembers().forEach(rm -> rm.setVote(null));

		room.setVotingState(Room.VotingState.OPEN);
	}
}
