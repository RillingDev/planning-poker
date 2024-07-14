package dev.rilling.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.rilling.planningpoker.data.Card;
import dev.rilling.planningpoker.data.CardSet;

import java.util.List;

/**
 * Model for {@link CardSet}.
 */
public record CardSetJson(@JsonProperty("name") String name, @JsonProperty("cards") List<CardJson> cards) {

	public static CardSetJson convert(CardSet cardSet) {
		return new CardSetJson(cardSet.getName(), cardSet.getCards().stream().sorted(Card.NATURAL_COMPARATOR).map(CardJson::convert).toList());
	}

}
