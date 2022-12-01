package com.cryptshare.planningpoker;

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
		final Card cardCoffee = new Card("Coffee", null);
		cardSet.getCards().addAll(Set.of(card1, card3));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember eve = new RoomMember("Eve");
		eve.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().addAll(Set.of(johnDoe, alice, bob, eve));

		johnDoe.setVote(new Vote(johnDoe, card1));
		alice.setVote(new Vote(alice, card3));
		bob.setVote(new Vote(bob, card3));

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

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
		myRoom.getMembers().addAll(Set.of(johnDoe, alice));

		johnDoe.setVote(new Vote(johnDoe, card1));
		alice.setVote(new Vote(alice, card3));

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

		// Nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card3);
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

		johnDoe.setVote(new Vote(johnDoe, card1));
		alice.setVote(new Vote(alice, card2));
		bob.setVote(new Vote(bob, card3));
		eve.setVote(new Vote(eve, card3));

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

		assertThat(voteSummary.highestVote()).isEqualTo(card3);
		assertThat(voteSummary.highestVoters()).containsExactlyInAnyOrder(bob, eve);
		assertThat(voteSummary.lowestVote()).isEqualTo(card1);
		assertThat(voteSummary.lowestVoters()).containsExactly(johnDoe);
	}

	@Test
	@DisplayName("calculates offset")
	void calculatesVariance() {
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

		johnDoe.setVote(new Vote(johnDoe, card1));
		alice.setVote(new Vote(alice, card2));
		bob.setVote(new Vote(bob, card3));
		eve.setVote(new Vote(eve, card3));

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

		assertThat(voteSummary.offset()).isEqualTo(2);
	}

	@Test
	@DisplayName("calculates without members")
	void calculatesWhenNoMembers() {
		final CardSet cardSet = new CardSet("Set");

		final Room myRoom = new Room("My Room", cardSet);

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

		assertThat(voteSummary.average()).isZero();
		assertThat(voteSummary.offset()).isEqualTo(0);
		assertThat(voteSummary.highestVote().getValue()).isZero();
		assertThat(voteSummary.highestVoters()).isEmpty();
		assertThat(voteSummary.lowestVote().getValue()).isZero();
		assertThat(voteSummary.lowestVoters()).isEmpty();
	}

	@Test
	@DisplayName("calculates with only observers")
	void calculatesWhenOnlObservers() {
		final CardSet cardSet = new CardSet("Set");

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember johnDoe = new RoomMember("John Doe");
		johnDoe.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().add(johnDoe);

		final VoteSummary voteSummary = summaryService.getVoteSummary(myRoom);

		assertThat(voteSummary.average()).isZero();
		assertThat(voteSummary.offset()).isEqualTo(0);
		assertThat(voteSummary.highestVote().getValue()).isZero();
		assertThat(voteSummary.highestVoters()).isEmpty();
		assertThat(voteSummary.lowestVote().getValue()).isZero();
		assertThat(voteSummary.lowestVoters()).isEmpty();
	}
}