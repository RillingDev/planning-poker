package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.function.Function;

public record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSetName") String cardSetName,
					   @JsonProperty("members") List<RoomMemberJson> isModerator) {

	public static RoomJson convert(Room room, Function<RoomMember, RoomMemberJson> memberConverter) {
		return new RoomJson(
				room.getName(),
				room.getCardSet().getName(),
				room.getMembers().stream().sorted(RoomMemberJson.MEMBER_COMPARATOR).map(memberConverter).toList());
	}
}
