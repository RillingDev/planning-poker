package com.cryptshare.planningpoker.data;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CardSetRepositoryIT {

	@Autowired
	CardSetRepository cardSetRepository;

	@PersistenceContext
	EntityManager em;

	@BeforeEach
	void setUp() {
		cardSetRepository.deleteAll();
	}

	@Test
	@DisplayName("can be saved and loaded")
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		cardSet.getCards().add(new Card("1", 1.0));
		cardSet.getCards().add(new Card("Coffee", null));
		cardSet.setRelevantDecimalPlaces(2);
		cardSet.setShowAverageValue(true);
		cardSet.setShowNearestCard(false);
		cardSetRepository.save(cardSet);

		final CardSet loaded = cardSetRepository.findByName("Set #1").orElseThrow();
		assertThat(loaded.getName()).isEqualTo("Set #1");
		assertThat(loaded.getCards()).hasSize(2);
		assertThat(loaded.getCards()).extracting(Card::getName).containsExactlyInAnyOrder("1", "Coffee");
		assertThat(loaded.getCards()).extracting(Card::getValue).containsExactlyInAnyOrder(1.0, null);
		assertThat(loaded.getRelevantDecimalPlaces()).isEqualTo(2);
		assertThat(loaded.isShowAverageValue()).isTrue();
		assertThat(loaded.isShowNearestCard()).isFalse();
	}

	@Test
	@DisplayName("cascades delete to cards")
	void cascadesCardDeletion() {
		final CardSet cardSet = new CardSet("Set #1");
		cardSet.getCards().add(new Card("1", 1.0));
		cardSetRepository.save(cardSet);

		cardSetRepository.delete(cardSet);

		assertThat(cardSetRepository.count()).isZero();
		assertThat(em.createQuery("SELECT COUNT(*) FROM Card c", Long.class).getSingleResult()).isZero();
	}

	@Test
	@DisplayName("cascades detach to cards")
	void cascadesCardDetach() {
		final CardSet cardSet = new CardSet("Set #1");
		cardSet.getCards().add(new Card("1", 1.0));
		cardSetRepository.save(cardSet);

		cardSet.getCards().clear();
		cardSetRepository.save(cardSet);

		assertThat(em.createQuery("SELECT COUNT(*) FROM Card c", Long.class).getSingleResult()).isZero();
	}
}