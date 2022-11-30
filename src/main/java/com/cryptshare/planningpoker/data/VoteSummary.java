package com.cryptshare.planningpoker.data;

import java.util.Set;

public record VoteSummary(double average, double variance, Card nearestCard, Card highestVote, Set<RoomMember> highestVoters, Card lowestVote,
						  Set<RoomMember> lowestVoters) {

}
