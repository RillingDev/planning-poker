package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Comparator;

public record RoomMemberJson(@JsonProperty("username") String username, @JsonProperty("role") String role, @JsonProperty("vote") CardJson vote) {
	public static final Comparator<RoomMember> MEMBER_COMPARATOR = Comparator.comparing(RoomMember::getUsername);

	private static final CardJson HIDDEN_CARD = new CardJson("Voted", null);

	public static RoomMemberJson convertToBasic(RoomMember roomMember) {
		return convert(roomMember, null);
	}

	public static RoomMemberJson convertToDetailed(RoomMember roomMember, boolean hideVotes) {
		CardJson vote = null;
		if (roomMember.getVote() != null) {
			if (hideVotes) {
				vote = HIDDEN_CARD;
			} else {
				vote = CardJson.convert(roomMember.getVote().getCard());
			}
		}
		return convert(roomMember, vote);
	}

	private static RoomMemberJson convert(RoomMember roomMember, CardJson vote) {
		return new RoomMemberJson(roomMember.getUsername(), roomMember.getRole().name(), vote);
	}

}
