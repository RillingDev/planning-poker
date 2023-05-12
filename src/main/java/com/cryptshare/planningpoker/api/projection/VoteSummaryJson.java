package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.SummaryService;
import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.lang.Nullable;

import java.util.List;

public record VoteSummaryJson(@JsonProperty("average") @Nullable Double average, @JsonProperty("offset") double offset,
							  @JsonProperty("nearestCard") @Nullable CardJson nearestCard,
							  @JsonProperty("highestVote") CardJson highestVote,
							  @JsonProperty("highestVoters") List<RoomMemberJson> highestVoters,
							  @JsonProperty("lowestVote") CardJson lowestVote,
							  @JsonProperty("lowestVoters") List<RoomMemberJson> lowestVoters) {

	public static VoteSummaryJson convert(SummaryService.VoteSummary voteSummary) {
		return new VoteSummaryJson(
				voteSummary.average(),
				voteSummary.offset(),
				voteSummary.nearestCard() != null ? CardJson.convert(voteSummary.nearestCard()) : null,
				CardJson.convert(voteSummary.highestVote()),
				voteSummary.highestVoters().stream().sorted(RoomMember.ALPHABETIC_COMPARATOR).map(RoomMemberJson::convertToBasic).toList(),
				CardJson.convert(voteSummary.lowestVote()),
				voteSummary.lowestVoters().stream().sorted(RoomMember.ALPHABETIC_COMPARATOR).map(RoomMemberJson::convertToBasic).toList());
	}
}
