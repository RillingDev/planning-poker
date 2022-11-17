package com.cryptshare.planningpoker.entities;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")

class RoomRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);
		roomRepository.save(room);

		final List<Room> all = roomRepository.findAll();
		assertThat(all).hasSize(1);

		final Room loaded = all.get(0);
		assertThat(loaded.getName()).isEqualTo("My Room");
		assertThat(loaded.getCardSet()).isEqualTo(cardSet);
	}
}