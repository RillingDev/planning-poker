package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public record UserJson(@JsonProperty("username") String name) {
	public static UserJson convert(User user) {
		return new UserJson(user.getUsername());
	}
}
