package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.SummaryService.VoteSummary;
import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
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
	@DisplayName("calculates average value")
	void calculatesAverage() {
		final CardSet cardSet = new CardSet("Set");
		cardSet.setRelevantDecimalPlaces(10);
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		eve.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.average()).isCloseTo(2.333, Offset.offset(0.01));
	}

	@Test
	@DisplayName("rounds average value")
	void roundsAverage() {
		final CardSet cardSet = new CardSet("Set");
		cardSet.setRelevantDecimalPlaces(1);
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		eve.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.average()).isCloseTo(2.3, Offset.offset(0.01));
	}

	@Test
	@DisplayName("hides average value")
	void hidesAverage() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.setShowAverageValue(false);
		cardSet.getCards().addAll(Set.of(card1, card3, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		eve.setRole(RoomMember.Role.OBSERVER);
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.average()).isNull();
	}

	@Test
	@DisplayName("calculates nearest card")
	void calculatesNearest() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.nearestCard()).isEqualTo(card3);
	}

	@Test
	@DisplayName("hides nearest card")
	void hidesNearest() {
		final CardSet cardSet = new CardSet("Set");
		cardSet.setShowNearestCard(false);
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.nearestCard()).isNull();
	}

	@Test
	@DisplayName("calculates nearest card rounding up")
	void calculatesNearestRoundingUp() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card2, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		myRoom.getMembers().addAll(Set.of(bob, alice));

		bob.setVote(card1);
		alice.setVote(card2);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		// The nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card2);
	}

	@Test
	@DisplayName("calculates nearest card preferring basic numeric")
	void calculatesNearestPreferringBasicNumeric() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card1Text = new Card("One but with text", 1.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1Text, card1, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		myRoom.getMembers().addAll(Set.of(bob, alice));

		bob.setVote(card1Text);
		alice.setVote(card1);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		// The nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card1);
	}

	@Test
	@DisplayName("calculates nearest card preferring first in alphabetic order if only non-basic numeric match")
	void calculatesNearestPreferringAlphabetic() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1Text1 = new Card("A) One but with text", 1.0);
		final Card card1Text2 = new Card("B) One but with text", 1.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1Text1, card1Text2, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		myRoom.getMembers().addAll(Set.of(bob, alice));

		bob.setVote(card1Text1);
		alice.setVote(card1Text2);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		// The nearest card is rounded upwards
		assertThat(voteSummary.nearestCard()).isEqualTo(card1Text1);
	}
	@Test
	@DisplayName("calculates highest/lowest votes")
	void calculatesExtremes() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card2, card3,cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card2);
		carol.setVote(card3);
		eve.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.highest().card()).isEqualTo(card3);
		assertThat(voteSummary.highest().members()).containsExactlyInAnyOrder(carol, eve);
		assertThat(voteSummary.lowest().card()).isEqualTo(card1);
		assertThat(voteSummary.lowest().members()).containsExactly(bob);
	}


	@Test
	@DisplayName("does not calculate highest/lowest votes if all votes are the same")
	void skipsExtremes() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card2, card3,cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card1);
		carol.setVote(card1);
		eve.setVote(card1);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.highest()).isNull();
		assertThat(voteSummary.lowest()).isNull();
	}

	@Test
	@DisplayName("calculates highest/lowest votes preferring basic numeric")
	void calculatesExtremesPreferringBasicNumeric() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card1Text = new Card("One but with text", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card card3Text = new Card("Three but with text", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card1Text, card3, card3Text,cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card1Text);
		carol.setVote(card3);
		eve.setVote(card3Text);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.highest().card()).isEqualTo(card3);
		assertThat(voteSummary.highest().members()).containsExactlyInAnyOrder(carol);
		assertThat(voteSummary.lowest().card()).isEqualTo(card1);
		assertThat(voteSummary.lowest().members()).containsExactly(bob);
	}

	@Test
	@DisplayName("calculates highest/lowest votes preferring first in alphabetic order if only non-basic numeric match")
	void calculatesExtremesPreferringAlphabetic() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card1Text = new Card("One but with text", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card card3Text = new Card("Three but with text", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card1Text, card3, card3Text,cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card1Text);
		carol.setVote(card3);
		eve.setVote(card3Text);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.highest().card()).isEqualTo(card3);
		assertThat(voteSummary.highest().members()).containsExactlyInAnyOrder(carol);
		assertThat(voteSummary.lowest().card()).isEqualTo(card1);
		assertThat(voteSummary.lowest().members()).containsExactly(bob);
	}

	@Test
	@DisplayName("calculates offset")
	void calculatesOffset() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card2, card3,cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		final RoomMember eve = new RoomMember("Eve");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol, eve));

		bob.setVote(card1);
		alice.setVote(card2);
		carol.setVote(card3);
		eve.setVote(card3);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.offset()).isEqualTo(2);
	}

	@Test
	@DisplayName("calculates offset if multiple cards have the same value")
	void calculatesOffsetBasicNumeric() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card card3Text = new Card("Three but with text", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, card3Text, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card3Text);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		final VoteSummary voteSummary = summaryService.summarize(myRoom).orElseThrow();

		assertThat(voteSummary.offset()).isEqualTo(1);
	}

	@Test
	@DisplayName("calculates offset if multiple cards have the same value (with the cards with the same value on the low end)")
	void calculatesOffsetBasicNumericLowEnd() {
		final CardSet cardSet = new CardSet("Set");
		final Card card1 = new Card("1", 1.0);
		final Card card1Text = new Card("One but with text", 1.0);
		final Card card3 = new Card("3", 3.0);
		final Card cardQuestion = new Card("?", null);
		cardSet.getCards().addAll(Set.of(card1, card3, card1Text, cardQuestion));

		final Room myRoom = new Room("My Room", cardSet);
		final RoomMember bob = new RoomMember("Bob");
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember carol = new RoomMember("Carol");
		myRoom.getMembers().addAll(Set.of(bob, alice, carol));

		bob.setVote(card1);
		alice.setVote(card3);
		carol.setVote(card1Text);
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
		final RoomMember bob = new RoomMember("Bob");
		bob.setVote(card);
		myRoom.getMembers().add(bob);
		myRoom.setVotingState(Room.VotingState.CLOSED);

		assertThat(summaryService.summarize(myRoom)).isEmpty();
	}
}
