package com.cryptshare.planningpoker.data;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
class RoomRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	PlatformTransactionManager transactionManager;

	@PersistenceContext
	EntityManager em;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		// Ensure user table is filled.
		new TransactionTemplate(transactionManager).execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				em.createNativeQuery("INSERT INTO app_user (username) VALUES ('John Doe')").executeUpdate();
			}
		});

		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember("John Doe");
		room.getMembers().add(member);

		final Vote vote = new Vote(member, card);
		member.setVote(vote);

		roomRepository.save(room);

		final Room loaded = roomRepository.findByName("My Room").orElseThrow();
		assertThat(loaded.getName()).isEqualTo("My Room");
		assertThat(loaded.getMembers()).containsExactly(member);
		assertThat(loaded.getCardSet()).isEqualTo(cardSet);
	}
}