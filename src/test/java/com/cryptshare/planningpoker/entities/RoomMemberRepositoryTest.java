package com.cryptshare.planningpoker.entities;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
@DirtiesContext
class RoomMemberRepositoryTest {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoomMemberRepository roomMemberRepository;

	@Test
	void saveAndLoad() {
		final CardSet cardSet = prepareCardSet("Set #1");

		final Room room = prepareRoom("My Room", cardSet);

		final User user = prepareUser("Alice");

		final RoomMember roomMember = new RoomMember(room, user);
		roomMember.setRole(RoomMember.Role.MODERATOR);
		roomMemberRepository.save(roomMember);

		final List<RoomMember> all = roomMemberRepository.findAll();
		assertThat(all).hasSize(1);

		final RoomMember loaded = all.get(0);
		assertThat(loaded.getUser()).isEqualTo(user);
		assertThat(loaded.getRoom()).isEqualTo(room);
		assertThat(loaded.getRole()).isEqualTo(RoomMember.Role.MODERATOR);
	}

	@Test
	void findByRoom() {
		final CardSet cardSet = prepareCardSet("Set #1");

		final Room room1 = prepareRoom("My Room #1", cardSet);

		final Room room2 = prepareRoom("My Room #2", cardSet);

		final User user1 = prepareUser("Alice");
		final User user2 = prepareUser("Bob");
		final User user3 = prepareUser("John");

		final RoomMember roomMember1 = new RoomMember(room1, user1);
		roomMember1.setRole(RoomMember.Role.MODERATOR);
		roomMemberRepository.save(roomMember1);

		final RoomMember roomMember2 = new RoomMember(room1, user2);
		roomMember2.setRole(RoomMember.Role.USER);
		roomMemberRepository.save(roomMember2);

		final RoomMember roomMember3 = new RoomMember(room2, user3);
		roomMember3.setRole(RoomMember.Role.USER);
		roomMemberRepository.save(roomMember3);

		final Set<RoomMember> all = roomMemberRepository.findByRoom(room1);
		assertThat(all).hasSize(2).containsExactlyInAnyOrder(roomMember1, roomMember2);
	}

	private User prepareUser(String username) {
		final User user = new User(username);
		userRepository.save(user);
		return user;
	}

	private CardSet prepareCardSet(String name) {
		final CardSet cardSet = new CardSet(name);
		cardSetRepository.save(cardSet);
		return cardSet;
	}

	private Room prepareRoom(String My_Room, CardSet cardSet) {
		final Room room = new Room(My_Room, cardSet);
		roomRepository.save(room);
		return room;
	}

}