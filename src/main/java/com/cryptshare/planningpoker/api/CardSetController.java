package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.projection.CardSetJson;
import com.cryptshare.planningpoker.data.CardSetRepository;
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
	List<CardSetJson> loadCardSets() {
		return cardSetRepository.findAll().stream().sorted().map(CardSetJson::convert).toList();
	}

}
