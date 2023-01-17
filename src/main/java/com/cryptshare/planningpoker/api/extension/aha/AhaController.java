package com.cryptshare.planningpoker.api.extension.aha;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@RestController
@Profile("extension:aha")
class AhaController {

	private final String accountDomain;
	private final String clientId;
	private final String redirectUri;
	private final List<String> scoreFactNames;

	AhaController(Environment environment) {
		accountDomain = environment.getRequiredProperty("planning-poker.extension.aha.account-domain");
		clientId = environment.getRequiredProperty("planning-poker.extension.aha.client-id");
		redirectUri = environment.getRequiredProperty("planning-poker.extension.aha.redirect-uri");

		scoreFactNames = Arrays.stream(environment.getRequiredProperty("planning-poker.extension.aha.score-fact-names").split(","))
				.map(String::trim)
				.sorted(Comparator.naturalOrder())
				.toList();
	}

	@GetMapping(value = "/api/extensions/aha/config", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	AhaConfigJson getConfig() {
		return new AhaConfigJson(accountDomain, clientId, redirectUri, scoreFactNames);
	}

	record AhaConfigJson(@JsonProperty("accountDomain") String accountDomain, @JsonProperty("clientId") String clientId,
						 @JsonProperty("redirectUri") String redirectUri, @JsonProperty("scoreFactNames") List<String> scoreFactNames) {

	}

}
