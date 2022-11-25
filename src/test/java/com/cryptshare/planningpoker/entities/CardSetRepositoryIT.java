package com.cryptshare.planningpoker.entities;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
class CardSetRepositoryIT {

	@Autowired
	CardSetRepository cardSetRepository;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		cardSet.getCards().add(new Card("1", 1.0));
		cardSet.getCards().add(new Card("Coffee", null));
		cardSetRepository.save(cardSet);

		final CardSet loaded = cardSetRepository.findByName("Set #1").orElseThrow();
		assertThat(loaded.getName()).isEqualTo("Set #1");

		assertThat(loaded.getCards()).hasSize(2);
		assertThat(loaded.getCards()).extracting(Card::getName).containsExactlyInAnyOrder("1", "Coffee");
		assertThat(loaded.getCards()).extracting(Card::getValue).containsExactlyInAnyOrder(1.0, null);
	}
}