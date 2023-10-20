package com.cryptshare.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Model for a user.
 */
public record UserJson(@JsonProperty("username") String name) {
}
