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

	@Autowired
	UserRepository userRepository;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final User user = new User("John Doe");
		userRepository.save(user);

		final CardSet cardSet = new CardSet("Set #1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		cardSetRepository.save(cardSet);

		final Room room = new Room("My Room", cardSet);

		final RoomMember member = new RoomMember(user, RoomMember.Role.USER);
		room.getMembers().add(member);

		final Vote vote = new Vote(member, card);
		member.setVote(vote);

		roomRepository.save(room);

		final List<Room> all = roomRepository.findAll();
		assertThat(all).hasSize(1);

		final Room loaded = all.get(0);
		assertThat(loaded.getName()).isEqualTo("My Room");
		assertThat(loaded.getMembers()).containsExactly(member);
		assertThat(loaded.getCardSet()).isEqualTo(cardSet);
	}
}