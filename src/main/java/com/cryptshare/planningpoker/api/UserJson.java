package com.cryptshare.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserJson(@JsonProperty("username") String name) {
}
