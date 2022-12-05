package com.cryptshare.planningpoker.data;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
class RoomRepositoryIT {
	@Autowired
	RoomRepository roomRepository;

	@Autowired
	CardSetRepository cardSetRepository;

	@Autowired
	UserDetailsManager jdbcUserDetailsManager;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		// Ensure user table is filled.
		jdbcUserDetailsManager.createUser(User.withUsername("John Doe").password("changeme").roles("USER").build());

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