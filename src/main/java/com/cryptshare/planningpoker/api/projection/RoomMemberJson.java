package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.RoomMember;
import com.fasterxml.jackson.annotation.JsonProperty;

record RoomMemberJson(@JsonProperty("username") String name, @JsonProperty("role") int role) {
	static RoomMemberJson convert(RoomMember roomMember) {
		return new RoomMemberJson(roomMember.getUser().getUsername(), roomMember.getRole().ordinal());
	}
}
