package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.CardSet;
import dev.rilling.planningpoker.data.CardSetRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
class CardSetController {

	private final CardSetRepository cardSetRepository;

	CardSetController(CardSetRepository cardSetRepository) {
		this.cardSetRepository = cardSetRepository;
	}

	@GetMapping(value = "/api/card-sets", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<CardSetJson> getCardSets() {
		return cardSetRepository.findAll().stream().sorted(CardSet.ALPHABETIC_COMPARATOR).map(CardSetJson::convert).toList();
	}

}
