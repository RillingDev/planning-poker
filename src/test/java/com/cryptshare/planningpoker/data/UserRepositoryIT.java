package com.cryptshare.planningpoker.data;

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
class UserRepositoryIT {
	@Autowired
	UserRepository userRepository;

	@Test
	@DisplayName("can be saved and loaded")
	@DirtiesContext
	void saveAndLoad() {
		final User user = new User("Alice");
		userRepository.save(user);

		final List<User> all = userRepository.findAll();
		assertThat(all).hasSize(1);

		final User loaded = all.get(0);
		assertThat(loaded.getUsername()).isEqualTo("Alice");
	}
}