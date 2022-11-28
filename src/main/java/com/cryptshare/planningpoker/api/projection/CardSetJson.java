package com.cryptshare.planningpoker.api.projection;

import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.CardSet;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Comparator;
import java.util.List;

public record CardSetJson(@JsonProperty("name") String name, @JsonProperty("cards") List<CardJson> cards) {
	private static final Comparator<Card> CARD_COMPARATOR = Comparator.comparing(Card::getValue,
			Comparator.nullsLast(Comparator.naturalOrder()));

	public static CardSetJson convert(CardSet cardSet) {
		return new CardSetJson(cardSet.getName(), cardSet.getCards().stream().sorted(CARD_COMPARATOR).map(CardJson::convert).toList());
	}

	private record CardJson(@JsonProperty("name") String name, @JsonProperty("value") Double value) {
		static CardJson convert(Card card) {
			return new CardJson(card.getName(), card.getValue());
		}
	}
}
