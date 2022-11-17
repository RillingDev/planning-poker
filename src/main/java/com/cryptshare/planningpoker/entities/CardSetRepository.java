package com.cryptshare.planningpoker.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CardSetRepository extends JpaRepository<CardSet, UUID> {
}
