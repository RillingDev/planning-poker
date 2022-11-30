package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.SummaryService;
import com.cryptshare.planningpoker.api.exception.NotAMemberException;
import com.cryptshare.planningpoker.api.exception.RoomNotFoundException;
import com.cryptshare.planningpoker.api.projection.RoomJson;
import com.cryptshare.planningpoker.api.projection.VoteSummaryJson;
import com.cryptshare.planningpoker.data.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
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

	@GetMapping(value = "/api/rooms/{room-name}/")
	@Transactional
	@ResponseBody
	RoomJson getRoom(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		return RoomJson.convertToDetailed(room, !room.isVotingComplete());
	}

	@PostMapping(value = "/api/rooms/{room-name}/votes")
	@Transactional
	void createVote(@PathVariable("room-name") String roomName, @RequestParam("card-name") String cardName,
			@AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		final RoomMember roomMember = room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		final Card card = room.getCardSet()
				.getCards().stream().filter(c -> c.getName().equals(cardName)).findFirst().orElseThrow(CardNotFoundException::new);

		roomMember.setVote(new Vote(roomMember, card));
		roomRepository.save(room);
		logger.info("User '{}' voted with '{}'.", user, card);
	}

	@GetMapping(value = "/api/rooms/{room-name}/votes/summary")
	@Transactional
	@ResponseBody
	VoteSummaryJson getSummary(@PathVariable("room-name") String roomName, @AuthenticationPrincipal UserDetails user) {
		final Room room = roomRepository.findByName(roomName).orElseThrow(RoomNotFoundException::new);

		room.findMemberByUser(user.getUsername()).orElseThrow(NotAMemberException::new);

		if (!room.isVotingComplete()) {
			throw new VotingInProgressException();
		}

		return VoteSummaryJson.convert(summaryService.getVoteSummary(room));
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such card in this rooms card-set.")
	private static class CardNotFoundException extends RuntimeException {
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Voting is still in progress.")
	private static class VotingInProgressException extends RuntimeException {
	}

}
