package com.cryptshare.planningpoker.data;

import java.util.Set;

public record VoteSummary(double average, int offset, Card nearestCard, Card highestVote, Set<RoomMember> highestVoters, Card lowestVote,
						  Set<RoomMember> lowestVoters) {

}
