package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.function.Function;

public record RoomJson(@JsonProperty("name") String name, @JsonProperty("cardSet") CardSetJson cardSet,
					   @JsonProperty("members") List<RoomMemberJson> members, @JsonProperty("votingComplete") boolean votingComplete) {

	public static RoomJson convertToBasic(Room room) {
		return convert(room, RoomMemberJson::convertToBasic);
	}

	public static RoomJson convertToDetailed(Room room, boolean showVotes) {
		return convert(room, roomMember -> RoomMemberJson.convertToDetailed(roomMember, showVotes));
	}

	private static RoomJson convert(Room room, Function<RoomMember, RoomMemberJson> roomMemberMapper) {
		return new RoomJson(
				room.getName(),
				CardSetJson.convert(room.getCardSet()),
				room.getMembers().stream().sorted(RoomMember.COMPARATOR).map(roomMemberMapper).toList(),
				room.isVotingComplete());
	}
}
