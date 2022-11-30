package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.*;
import org.assertj.core.data.Offset;
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
	void name() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		final Card card5 = new Card("5", 5.0);
		final Card card8 = new Card("8", 8.0);
		final Card cardCoffee = new Card("Coffee", null);
		cardSet.getCards().addAll(Set.of(card1, card2, card3, card5, card8, cardCoffee));

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

		assertThat(voteSummary.averageValue()).isCloseTo(2.333, Offset.offset(0.1));
		assertThat(voteSummary.nearestCard()).isEqualTo(card3);
		assertThat(voteSummary.highestVote()).isEqualTo(card3);
		assertThat(voteSummary.highestVoters()).containsExactlyInAnyOrder(alice, bob);
		assertThat(voteSummary.lowestVoters()).containsExactly(johnDoe);
	}
}