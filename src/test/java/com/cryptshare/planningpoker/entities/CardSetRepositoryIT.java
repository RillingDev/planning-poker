package com.cryptshare.planningpoker.entities;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
class CardSetRepositoryIT {

	@Autowired
	CardSetRepository cardSetRepository;

	@Test
	void loadAll() {
		final CardSet cardSet = new CardSet("foo");
		cardSet.getCards().add(new Card("1", 1.0));
		cardSet.getCards().add(new Card("5", 5.0));
		cardSet.getCards().add(new Card("foo", null));
		cardSetRepository.save(cardSet);

		final List<CardSet> all = cardSetRepository.findAll();
		System.out.println(1);
	}
}