package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Card;
import com.fasterxml.jackson.annotation.JsonProperty;

record CardJson(@JsonProperty("name") String name, @JsonProperty("value") Double value, @JsonProperty("description") String description) {

	public static CardJson convert(Card card) {
		return new CardJson(card.getName(), card.getValue(), card.getDescription());
	}
}
