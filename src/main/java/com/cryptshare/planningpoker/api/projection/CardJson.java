package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Card;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Comparator;

record CardJson(@JsonProperty("name") String name, @JsonProperty("value") Double value) {
	public static final Comparator<Card> CARD_COMPARATOR = Comparator.comparing(Card::getValue, Comparator.nullsLast(Comparator.naturalOrder()));

	public static CardJson convert(Card card) {
		return new CardJson(card.getName(), card.getValue());
	}
}
