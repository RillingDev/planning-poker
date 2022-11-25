package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.Card;
import com.cryptshare.planningpoker.entities.CardSet;
import com.cryptshare.planningpoker.entities.CardSetRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
class CardSetController {

	private static final Comparator<Card> CARD_COMPARATOR = Comparator.comparing(Card::getValue,
			Comparator.nullsLast(Comparator.naturalOrder()));

	private final CardSetRepository cardSetRepository;

	CardSetController(CardSetRepository cardSetRepository) {
		this.cardSetRepository = cardSetRepository;
	}

	@GetMapping(value = "/api/card-sets", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	List<CardSetJson> loadCardSets() {
		return cardSetRepository.findAll().stream().map(CardSetJson::convert).toList();
	}

	private record CardSetJson(@JsonProperty("name") String name, @JsonProperty("cards") List<CardJson> cards) {
		static CardSetJson convert(CardSet cardSet) {
			return new CardSetJson(cardSet.getName(), cardSet.getCards().stream().sorted(CARD_COMPARATOR).map(CardJson::convert).toList());
		}
	}

	private record CardJson(@JsonProperty("name") String name, @JsonProperty("value") Double value) {
		static CardJson convert(Card card) {
			return new CardJson(card.getName(), card.getValue());
		}
	}
}
