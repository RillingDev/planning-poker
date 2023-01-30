package com.cryptshare.planningpoker.data;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CardTest {

	@RepeatedTest(100) // Test relies on random shuffled input, so we test several.
	@DisplayName("is sorted")
	void order() {
		final Card card0 = new Card("0", 0.0);
		final Card card05 = new Card("0.5", 0.5);
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		final Card card3 = new Card("3", 3.0);
		final Card card5 = new Card("5", 5.0);
		final Card card8 = new Card("8", 8.0);
		final Card card13 = new Card("13", 13.0);
		final Card cardCoffee = new Card("Coffee", 0.0);
		final Card cardWayTooMuch = new Card("Way too much!!!", 100.0);
		final Card cardDunno = new Card("dunno...", null);
		final Card cardQ = new Card("unknown", null);

		final List<Card> unordered = new ArrayList<>(List.of(card0,
				card05,
				card1,
				card2,
				card3,
				card5,
				card8,
				card13,
				cardCoffee,
				cardWayTooMuch,
				cardDunno,
				cardQ));
		Collections.shuffle(unordered);

		final List<Card> ordered = unordered.stream().sorted(Card.NATURAL_COMPARATOR).toList();
		assertThat(ordered).containsExactly(card0,
				card05,
				card1,
				card2,
				card3,
				card5,
				card8,
				card13,
				cardCoffee,
				cardWayTooMuch,
				cardDunno,
				cardQ);
	}
}
