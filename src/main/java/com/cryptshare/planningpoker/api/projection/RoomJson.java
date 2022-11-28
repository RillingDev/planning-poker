package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Comparator;
import java.util.List;

public record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName,
					   @JsonProperty("members") List<RoomMemberJson> isModerator) {
	private static final Comparator<RoomMember> MEMBER_COMPARATOR = Comparator.comparing(roomMember -> roomMember.getUser().getUsername());

	public static RoomJson convert(Room room) {
		return new RoomJson(
				room.getName(),
				room.getCardSet().getName(),
				room.getMembers().stream().sorted(MEMBER_COMPARATOR).map(RoomMemberJson::convert).toList());
	}
}
