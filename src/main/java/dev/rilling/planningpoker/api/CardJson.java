package dev.rilling.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.rilling.planningpoker.data.Card;
import org.springframework.lang.Nullable;

/**
 * Model for {@link Card}.
 */
record CardJson(@JsonProperty("name") String name, @Nullable @JsonProperty("value") Double value,
				@JsonProperty("description") String description) {

	public static CardJson convert(Card card) {
		return new CardJson(card.getName(), card.getValue(), card.getDescription());
	}
}
