package com.cryptshare.planningpoker.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ExtensionRepository extends JpaRepository<Extension, UUID> {

	Set<Extension> findAllByEnabled(boolean enabled);

	Optional<Extension> findByKey(String key);
}
