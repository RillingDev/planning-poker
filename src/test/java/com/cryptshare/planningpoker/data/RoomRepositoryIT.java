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

	@BeforeEach
	void setUp() {
		cardSetRepository.deleteAll();
		roomRepository.deleteAll();
		createExampleUser();
	}

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);
		room.setTopic("topic!");
		room.setVotingState(Room.VotingState.CLOSED);

		final RoomMember member = new RoomMember("John Doe");
		room.getMembers().add(member);
		member.setVote(card);

		final RoomExtension extension = new RoomExtension("aha");
		room.getExtensions().add(extension);

		roomRepository.save(room);

		final Room loaded = roomRepository.findByName("My Room").orElseThrow();
		assertThat(loaded.getName()).isEqualTo("My Room");
		assertThat(loaded.getCardSet()).isEqualTo(cardSet);
		assertThat(loaded.getTopic()).isEqualTo("topic!");
		assertThat(loaded.getMembers()).containsExactly(member);
		assertThat(loaded.getExtensions()).containsExactly(extension);
		assertThat(loaded.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("cascades delete to members")
	@DirtiesContext
	void cascadesMemberDeletion() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember("John Doe");
		room.getMembers().add(member);
		member.setVote(card);

		roomRepository.save(room);

		roomRepository.delete(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomMember rm", Long.class).getSingleResult()).isZero();
		assertThat(em.createNativeQuery("SELECT COUNT(*) FROM vote", Long.class).getSingleResult()).isEqualTo(0L);

		assertThat(em.createQuery("SELECT COUNT(*) FROM Card c", Long.class).getSingleResult()).isEqualTo(1); // Vote may not be cascaded
	}

	@Test
	@DisplayName("cascades detach to members")
	@DirtiesContext
	void cascadesMemberDetach() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember("John Doe");
		room.getMembers().add(member);
		member.setVote(card);

		roomRepository.save(room);

		room.getMembers().clear();

		roomRepository.save(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomMember rm", Long.class).getSingleResult()).isZero();
		assertThat(em.createNativeQuery("SELECT COUNT(*) FROM vote", Long.class).getSingleResult()).isEqualTo(0L);

		assertThat(em.createQuery("SELECT COUNT(*) FROM Card c", Long.class).getSingleResult()).isEqualTo(1); // Vote may not be cascaded
	}

	@Test
	@DisplayName("does not cascade delete to card set")
	@DirtiesContext
	void doesNotCascadeCardSet() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);
		roomRepository.save(room);

		roomRepository.delete(room);

		assertThat(cardSetRepository.findByName("Set #1")).isPresent();
	}

	@Test
	@DisplayName("cascades delete to extensions")
	@DirtiesContext
	void cascadesExtensionDeletion() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomExtension extension = new RoomExtension("aha");
		room.getExtensions().add(extension);

		roomRepository.save(room);

		roomRepository.delete(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomExtension re", Long.class).getSingleResult()).isZero();

		assertThat(em.createNativeQuery("SELECT COUNT(*) FROM extension", Long.class).getSingleResult()).isEqualTo(1L);
	}

	@Test
	@DisplayName("cascades detach to extensions")
	@DirtiesContext
	void cascadesExtensionDetach() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomExtension extension = new RoomExtension("aha");
		room.getExtensions().add(extension);

		roomRepository.save(room);

		room.getExtensions().clear();

		roomRepository.save(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomExtension re", Long.class).getSingleResult()).isZero();

		assertThat(em.createNativeQuery("SELECT COUNT(*) FROM extension", Long.class).getSingleResult()).isEqualTo(1L);
	}

	private void createExampleUser() {
		// Ensure user table is filled.
		new TransactionTemplate(transactionManager).execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				em.createNativeQuery("INSERT INTO app_user (username) VALUES ('John Doe')").executeUpdate();
			}
		});
	}
}
