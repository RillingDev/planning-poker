package com.cryptshare.planningpoker.data;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-integrationtest.properties")
class ExtensionRepositoryIT {

	@Autowired
	ExtensionRepository extensionRepository;

	@PersistenceContext
	EntityManager em;

	@BeforeEach
	void setUp() {
		extensionRepository.deleteAll();
	}

	@Test
	@DisplayName("can be saved and loaded")
	void saveAndLoad() {
		final Extension foo = new Extension("foo");
		foo.setEnabled(true);
		extensionRepository.save(foo);

		final Extension loaded = extensionRepository.findById(foo.getId()).orElseThrow();

		assertThat(loaded.getKey()).isEqualTo("foo");
		assertThat(loaded.isEnabled()).isTrue();
	}

	@Test
	@DisplayName("loads all by enabled")
	void findAllByEnabled() {
		final Extension foo = new Extension("foo");
		foo.setEnabled(true);
		extensionRepository.save(foo);
		final Extension bar = new Extension("bar");
		bar.setEnabled(false);
		extensionRepository.save(bar);
		final Extension fizz = new Extension("fizz");
		fizz.setEnabled(true);
		extensionRepository.save(fizz);

		final Set<Extension> loaded = extensionRepository.findAllByEnabled(true);

		assertThat(loaded).containsExactlyInAnyOrder(foo, fizz);
	}

	@Test
	@DisplayName("loads by enabled and key")
	void findAllByEnabledAndKey() {
		final Extension foo = new Extension("foo");
		foo.setEnabled(true);
		extensionRepository.save(foo);
		final Extension bar = new Extension("bar");
		bar.setEnabled(false);
		extensionRepository.save(bar);

		assertThat(extensionRepository.findByKeyAndEnabledIsTrue("foo")).get().isEqualTo(foo);
		assertThat(extensionRepository.findByKeyAndEnabledIsTrue("bar")).isEmpty();
	}
}