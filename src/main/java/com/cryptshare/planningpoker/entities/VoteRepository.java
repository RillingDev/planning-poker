package com.cryptshare.planningpoker.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {

	@Query("SELECT v FROM Vote v where v.roomMember.room = ?1")
	Set<Vote> findByRoom(Room room);
}
