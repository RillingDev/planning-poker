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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RoomRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	ExtensionRepository extensionRepository;

	@Autowired
	PlatformTransactionManager transactionManager;

	@PersistenceContext
	EntityManager em;

	@BeforeEach
	void setUp() {
		cardSetRepository.deleteAll();
		roomRepository.deleteAll();
		extensionRepository.deleteAll();
		createExampleUser();
	}

	@Test
	@DisplayName("can be saved and loaded")
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);
		room.setTopic("topic!");
		room.setVotingState(Room.VotingState.CLOSED);

		final RoomMember member = new RoomMember("Bob");
		room.getMembers().add(member);
		member.setVote(card);

		final Extension extension = new Extension("aha");
		extensionRepository.save(extension);

		final RoomExtensionConfig roomExtensionConfig = new RoomExtensionConfig(extension);
		roomExtensionConfig.getAttributes().put("foo", "bar");
		room.getExtensionConfigs().add(roomExtensionConfig);

		roomRepository.save(room);

		final Room loaded = roomRepository.findByName("My Room").orElseThrow();
		assertThat(loaded.getName()).isEqualTo("My Room");
		assertThat(loaded.getCardSet()).isEqualTo(cardSet);
		assertThat(loaded.getTopic()).isEqualTo("topic!");
		assertThat(loaded.getMembers()).containsExactly(member);
		assertThat(loaded.getExtensionConfigs()).containsExactly(roomExtensionConfig);
		assertThat(roomExtensionConfig.getAttributes()).containsEntry("foo", "bar");
		assertThat(loaded.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("cascades delete to members")
	void cascadesMemberDeletion() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember("Bob");
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
	void cascadesMemberDetach() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember("Bob");
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
	@DisplayName("cascades delete to extension config")
	void cascadesExtensionDeletion() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final Extension extension = new Extension("aha");
		extensionRepository.save(extension);

		final RoomExtensionConfig roomExtensionConfig = new RoomExtensionConfig(extension);
		roomExtensionConfig.getAttributes().put("foo", "bar");
		room.getExtensionConfigs().add(roomExtensionConfig);

		roomRepository.save(room);

		roomRepository.delete(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomExtensionConfig ref", Long.class).getSingleResult()).isZero();
		assertThat(em.createNativeQuery("SELECT COUNT(*) FROM room_extension_config_attribute", Long.class).getSingleResult()).isEqualTo(0L);
		assertThat(em.createQuery("SELECT COUNT(*) FROM Extension ref", Long.class).getSingleResult()).isEqualTo(1);
	}

	@Test
	@DisplayName("cascades detach to extension config")
	void cascadesExtensionDetach() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final Extension extension = new Extension("aha");
		extensionRepository.save(extension);

		final RoomExtensionConfig roomExtensionConfig = new RoomExtensionConfig(extension);
		room.getExtensionConfigs().add(roomExtensionConfig);

		roomRepository.save(room);

		room.getExtensionConfigs().clear();

		roomRepository.save(room);

		assertThat(em.createQuery("SELECT COUNT(*) FROM RoomExtensionConfig ref", Long.class).getSingleResult()).isZero();
		assertThat(em.createQuery("SELECT COUNT(*) FROM Extension ref", Long.class).getSingleResult()).isEqualTo(1);
	}

	private void createExampleUser() {
		// Ensure user table is filled.
		new TransactionTemplate(transactionManager).execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				em.createNativeQuery("INSERT INTO app_user (username) VALUES ('Bob')").executeUpdate();
			}
		});
	}
}
