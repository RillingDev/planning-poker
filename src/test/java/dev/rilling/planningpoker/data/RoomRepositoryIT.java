package dev.rilling.planningpoker.data;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Sql({ "/delete-initial-data.sql", "/create-dummy-user.sql" })
class RoomRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	ExtensionRepository extensionRepository;

	@PersistenceContext
	EntityManager em;

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
		Assertions.assertThat(loaded.getExtensionConfigs()).containsExactly(roomExtensionConfig);
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

		Assertions.assertThat(cardSetRepository.findByName("Set #1")).isPresent();
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

}
