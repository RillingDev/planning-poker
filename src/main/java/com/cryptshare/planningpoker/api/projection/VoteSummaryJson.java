package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.VoteSummary;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record VoteSummaryJson(@JsonProperty("average") double average, @JsonProperty("variance") double variance,
							  @JsonProperty("nearestCard") CardJson nearestCard, @JsonProperty("highestVote") CardJson highestVote,
							  @JsonProperty("highestVoters") List<RoomMemberJson> highestVoters, @JsonProperty("lowestVote") CardJson lowestVote,
							  @JsonProperty("lowestVoters") List<RoomMemberJson> lowestVoters) {

	public static VoteSummaryJson convert(VoteSummary voteSummary) {
		return new VoteSummaryJson(
				voteSummary.average(),
				voteSummary.variance(),
				CardJson.convert(voteSummary.nearestCard()),
				CardJson.convert(voteSummary.highestVote()),
				voteSummary.highestVoters().stream().sorted(RoomMember.COMPARATOR).map(RoomMemberJson::convertToBasic).toList(),
				CardJson.convert(voteSummary.lowestVote()),
				voteSummary.lowestVoters().stream().sorted(RoomMember.COMPARATOR).map(RoomMemberJson::convertToBasic).toList());
	}
}
