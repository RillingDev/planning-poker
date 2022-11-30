package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.VoteSummary;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record VoteSummaryJson(@JsonProperty("averageValue") double averageValue, @JsonProperty("nearestCard") CardJson nearestCard,
							  @JsonProperty("highestVote") CardJson highestVote,
							  @JsonProperty("highestVoters") List<RoomMemberJson> highestVoters,
							  @JsonProperty("highestVote") CardJson lowestVote, @JsonProperty("lowestVoters") List<RoomMemberJson> lowestVoters,
							  @JsonProperty("agreement") String agreement) {

	public static VoteSummaryJson convert(VoteSummary voteSummary) {
		return new VoteSummaryJson(
				voteSummary.averageValue(),
				CardJson.convert(voteSummary.nearestCard()),
				CardJson.convert(voteSummary.highestVote()),
				voteSummary.highestVoters().stream().sorted(RoomMember.COMPARATOR).map(RoomMemberJson::convertToBasic).toList(),
				CardJson.convert(voteSummary.lowestVote()),
				voteSummary.lowestVoters().stream().sorted(RoomMember.COMPARATOR).map(RoomMemberJson::convertToBasic).toList(),
				voteSummary.agreement().name());
	}
}
