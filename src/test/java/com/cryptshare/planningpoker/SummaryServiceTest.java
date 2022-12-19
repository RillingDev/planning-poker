package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.SummaryService.VoteSummary;
import com.cryptshare.planningpoker.data.*;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

	@InjectMocks
	SummaryService summaryService;

	@Test
	@DisplayName("calculates average")
	void calculatesAverage() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		cardSet.getCards().addAll(Set.of(card1, card3));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember eve = new RoomMember("Eve");
		eve.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob, eve));

		johnDoe.setVote( card1);
		alice.setVote( card3);
		bob.setVote( card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.average()).isCloseTo(2.333, Offset.offset(0.01));
	}

	@Test
	@DisplayName("calculates nearest card")
	void calculatesNearest() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		cardSet.getCards().addAll(Set.of(card1, card3));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob));

		johnDoe.setVote( card1);
		alice.setVote( card3);
		bob.setVote( card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.nearestCard()).isEqualTo(card3);
	}

	@Test
	@DisplayName("calculates nearest card rounding up")
	void calculatesNearestRoundingUp() {
		final CardSet cardSet = new CardSet("Set");
		final Card card0 = new Card("0", 0.0);
		final Card card1 = new Card("1", 1.0);
		cardSet.getCards().addAll(Set.of(card0, card1));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice));

		johnDoe.setVote( card0);
		alice.setVote( card1);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		// Nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card1);
	}

	@Test
	@DisplayName("calculates nearest card rounding towards basic numeric")
	void calculatesNearestRoundingBasicNumeric() {
		final CardSet cardSet = new CardSet("Set");
		final Card card0 = new Card("Coffee", 0.0);
		final Card card1 = new Card("0", 0.0);
		cardSet.getCards().addAll(Set.of(card0, card1));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice));

		johnDoe.setVote( card0);
		alice.setVote( card1);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		// Nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card1);
	}

	@Test
	@DisplayName("calculates min/max votes")
	void calculatesMinMax() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		cardSet.getCards().addAll(Set.of(card1, card2, card3));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob, eve));

		johnDoe.setVote( card1);
		alice.setVote( card2);
		bob.setVote( card3);
		eve.setVote( card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.highestVote()).isEqualTo(card3);
		assertThat(voteSummary.highestVoters()).containsExactlyInAnyOrder(bob, eve);
		assertThat(voteSummary.lowestVote()).isEqualTo(card1);
		assertThat(voteSummary.lowestVoters()).containsExactly(johnDoe);
	}

	@Test
	@DisplayName("calculates offset")
	void calculatesOffset() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		cardSet.getCards().addAll(Set.of(card1, card2, card3));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob, eve));

		johnDoe.setVote( card1);
		alice.setVote( card2);
		bob.setVote( card3);
		eve.setVote( card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.offset()).isEqualTo(2);
	}

	@Test
	@DisplayName("calculates offset with basic numeric")
	void calculatesOffsetBasicNumeric() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card2text = new Card("Two but text", 2.0);
		cardSet.getCards().addAll(Set.of(card1, card2, card2text));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob));

		johnDoe.setVote( card1);
		alice.setVote( card2);
		bob.setVote( card2text);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.offset()).isEqualTo(1);
	}

	@Test
	@DisplayName("calculates without members")
	void calculatesWhenNoMembers() {
		final CardSet cardSet = new CardSet("Set");

		final Room myRoom = new Room("My Room", cardSet);
		myRoom.setVotingState(Room.VotingState.OPEN);

		assertThat(summaryService.summarize(myRoom)).isEmpty();
	}

	@Test
	@DisplayName("calculates with only non-value votes")
	void calculatesWhenOnlObservers() {
		final CardSet cardSet = new CardSet("Set");
		final Card card = new Card("?", null);
		cardSet.getCards().add(card);

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		johnDoe.setVote( card);
		myRoom.getMembers().add(johnDoe);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		assertThat(summaryService.summarize(myRoom)).isEmpty();
	}
}
