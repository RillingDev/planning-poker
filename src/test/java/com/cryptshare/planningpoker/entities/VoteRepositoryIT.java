package com.cryptshare.planningpoker.entities;

import org.junit.jupiter.api.DisplayName;
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
class VoteRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoomMemberRepository roomMemberRepository;

	@Autowired
	VoteRepository voteRepository;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = prepareRoom("My Room", cardSet);

		final User user = prepareUser("Alice");

		final RoomMember roomMember = new RoomMember(room, user, RoomMember.Role.MODERATOR);
		roomMemberRepository.save(roomMember);

		final Vote vote = new Vote(roomMember, card);
		voteRepository.save(vote);

		final List<Vote> all = voteRepository.findAll();
		assertThat(all).hasSize(1);

		final Vote loaded = all.get(0);
		assertThat(loaded.getCard()).isEqualTo(card);
		assertThat(loaded.getRoomMember()).isEqualTo(roomMember);
	}

	@Test
	@DisplayName("finds by room")
	@DirtiesContext
	void findByRoom() {
		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = prepareRoom("My Room", cardSet);

		final User user = prepareUser("Alice");

		final RoomMember roomMember = new RoomMember(room, user, RoomMember.Role.MODERATOR);
		roomMemberRepository.save(roomMember);

		final Vote vote = new Vote(roomMember, card);
		voteRepository.save(vote);

		final Set<Vote> byRoom = voteRepository.findByRoom(room);
		assertThat(byRoom).containsExactlyInAnyOrder(vote);
	}

	private User prepareUser(String username) {
		final User user = new User(username);
		userRepository.save(user);
		return user;
	}

	private Room prepareRoom(String name, CardSet cardSet) {
		final Room room = new Room(name, cardSet);
		roomRepository.save(room);
		return room;
	}

}