package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.SummaryService;
import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.lang.Nullable;

import java.util.List;

public record VoteSummaryJson(@JsonProperty("average") @Nullable Double average, @JsonProperty("offset") double offset,
							  @JsonProperty("nearestCard") @Nullable CardJson nearestCard,
							  @JsonProperty("highest") VoteExtremeJson highest,
							  @JsonProperty("lowest") VoteExtremeJson lowest) {

	public static VoteSummaryJson convert(SummaryService.VoteSummary voteSummary) {
		return new VoteSummaryJson(
				voteSummary.average(),
				voteSummary.offset(),
				voteSummary.nearestCard() != null ? CardJson.convert(voteSummary.nearestCard()) : null,
				VoteExtremeJson.convert(voteSummary.highest()),
				VoteExtremeJson.convert(voteSummary.lowest()));
	}

	record VoteExtremeJson(@JsonProperty("card") CardJson card,
						   @JsonProperty("members") List<RoomMemberJson> members) {

		static VoteExtremeJson convert(SummaryService.VoteExtreme voteExtreme) {
			return new VoteExtremeJson(CardJson.convert(voteExtreme.card()),
					voteExtreme.members().stream().sorted(RoomMember.ALPHABETIC_COMPARATOR).map(RoomMemberJson::convertToBasic).toList());
		}
	}
}
