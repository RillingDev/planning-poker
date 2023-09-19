package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.Card;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.lang.Nullable;

record CardJson(@JsonProperty("name") String name, @Nullable @JsonProperty("value") Double value,
				@Nullable @JsonProperty("description") String description) {

	public static CardJson convert(Card card) {
		return new CardJson(card.getName(), card.getValue(), card.getDescription());
	}
}
