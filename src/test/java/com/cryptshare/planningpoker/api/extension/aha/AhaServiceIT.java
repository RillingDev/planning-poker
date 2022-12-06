package com.cryptshare.planningpoker.api.extension.aha;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = { "planning-poker.extension.aha.score-fact-names=Fact Name 1,Fact Name 2",
		"planning-poker.extension.aha.subdomain=example", "planning-poker.extension.aha.key=th1sK3y1sFak3" })
@ActiveProfiles("extension:aha")
class AhaServiceIT {

	@Autowired
	AhaService ahaService;

	@Test
	@DisplayName("parses configured fact names")
	void getScoreFactNames() {
		assertThat(ahaService.getScoreFactNames()).containsExactlyInAnyOrder("Fact Name 1", "Fact Name 2");
	}

	@Test
	@DisplayName("creates JSON payload")
	void createIdeaPayload() {
		final ObjectNode ideaPayload = ahaService.createIdeaPayload("Fact Name 1", 10);
		assertThat(ideaPayload.toString()).isEqualToIgnoringWhitespace("""
				{
					"idea": {
						"score_facts": [
							{
								"name": "Fact Name 1",
								"value": 10
							}
						]
					}
				}""");
	}
}