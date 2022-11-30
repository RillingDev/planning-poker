package com.cryptshare.planningpoker.data;

import java.util.Set;

public record VoteSummary(double averageValue, Card nearestCard, Card highestVote, Set<RoomMember> highestVoters, Card lowestVote,
						  Set<RoomMember> lowestVoters, Agreement agreement) {
	public enum Agreement {
		LOW,
		AVERAGE,
		HIGH
	}
}
