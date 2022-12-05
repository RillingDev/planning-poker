package com.cryptshare.planningpoker.api.extension.aha;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Client to interact with the <a href="https://www.aha.io/api">Aha! Rest API</a>.
 * <p>
 * For the different flags, see the README.
 */
@Service
@Profile("extension:aha")
class AhaService {

	private static final JsonNodeFactory NODE_FACTORY = JsonNodeFactory.instance;
	private static final Pattern IDEA_PATTERN = Pattern.compile("https://\\S+\\.aha\\.io/ideas/\\S+");

	private final RestTemplate restTemplate;

	private final Set<String> scoreFactNames;

	AhaService(Environment environment, RestTemplateBuilder restTemplateBuilder) {
		scoreFactNames = Arrays.stream(environment.getRequiredProperty("planning-poker.extension.aha.score-fact-names").split(","))
				.map(String::trim)
				.collect(Collectors.toSet());

		final String subdomain = environment.getRequiredProperty("planning-poker.extension.aha.subdomain");
		final URI rootUri = new DefaultUriBuilderFactory().builder()
				.scheme("https")
				.host("{subdomain}.aha.io")
				.path("/api/v1/")
				.build(Map.of("subdomain", subdomain));

		final String apiKey = environment.getRequiredProperty("planning-poker.extension.aha.key");

		this.restTemplate = restTemplateBuilder.rootUri(rootUri.toString())
				.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer %s".formatted(apiKey))
				.defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
				.build();
	}

	public void putIdeaScore(String ideaId, String scoreFactName, int value) {
		final ObjectNode root = NODE_FACTORY.objectNode();
		final ObjectNode idea = NODE_FACTORY.objectNode();
		root.set("idea", idea);
		final ArrayNode scoreFacts = NODE_FACTORY.arrayNode();
		idea.set("score_facts", scoreFacts);
		final ObjectNode scoreFact = NODE_FACTORY.objectNode();
		scoreFacts.add(scoreFact);
		scoreFact.put("name", scoreFactName);
		scoreFact.put("value", value);

		this.restTemplate.put("/ideas/{idea}/", root, Map.of("idea", ideaId));
	}

	public Set<String> getScoreFactNames() {
		return scoreFactNames;
	}
}
