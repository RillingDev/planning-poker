package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RoomMemberJson(@JsonProperty("username") String username, @JsonProperty("role") String role,
							 @JsonProperty("vote") CardJson vote) {

	private static final CardJson HIDDEN_CARD = new CardJson("Voted", null, null);

	public static RoomMemberJson convertToBasic(RoomMember roomMember) {
		return convert(roomMember, null);
	}

	public static RoomMemberJson convertToDetailed(RoomMember roomMember, boolean showVotes) {
		CardJson vote = null;
		if (roomMember.getVote() != null) {
			if (showVotes) {
				vote = CardJson.convert(roomMember.getVote());
			} else {
				vote = HIDDEN_CARD;
			}
		}
		return convert(roomMember, vote);
	}

	private static RoomMemberJson convert(RoomMember roomMember, CardJson vote) {
		return new RoomMemberJson(roomMember.getUsername(), roomMember.getRole().name(), vote);
	}

}
