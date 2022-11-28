package com.cryptshare.planningpoker.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardSetRepository extends JpaRepository<CardSet, UUID> {
	Optional<CardSet> findByName(String name);
}
