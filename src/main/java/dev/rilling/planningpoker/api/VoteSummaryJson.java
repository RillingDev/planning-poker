package dev.rilling.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.rilling.planningpoker.SummaryService;
import dev.rilling.planningpoker.data.RoomMember;
import org.springframework.lang.Nullable;

import java.util.List;

public record VoteSummaryJson(@JsonProperty("average") @Nullable Double average, @JsonProperty("offset") double offset,
							  @JsonProperty("nearestCard") @Nullable CardJson nearestCard,
							  @JsonProperty("highest") @Nullable VoteExtremeJson highest,
							  @JsonProperty("lowest") @Nullable VoteExtremeJson lowest) {

	public static VoteSummaryJson convert(SummaryService.VoteSummary voteSummary) {
		return new VoteSummaryJson(
				voteSummary.average(),
				voteSummary.offset(),
				voteSummary.nearestCard() != null ? CardJson.convert(voteSummary.nearestCard()) : null,
				voteSummary.highest() != null ? VoteExtremeJson.convert(voteSummary.highest()) : null,
				voteSummary.lowest() != null ? VoteExtremeJson.convert(voteSummary.lowest()) : null);
	}

	record VoteExtremeJson(@JsonProperty("card") CardJson card, @JsonProperty("members") List<RoomMemberJson> members) {

		static VoteExtremeJson convert(SummaryService.VoteExtreme voteExtreme) {
			return new VoteExtremeJson(
					CardJson.convert(voteExtreme.card()),
					voteExtreme.members().stream().sorted(RoomMember.ALPHABETIC_COMPARATOR).map(RoomMemberJson::convertToBasic).toList());
		}
	}
}
