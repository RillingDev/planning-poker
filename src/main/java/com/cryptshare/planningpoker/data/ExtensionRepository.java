package com.cryptshare.planningpoker.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.stream.Stream;

@Repository
public interface ExtensionRepository extends JpaRepository<Extension, UUID> {

	Stream<Extension> findAllByEnabled(boolean enabled);
}
