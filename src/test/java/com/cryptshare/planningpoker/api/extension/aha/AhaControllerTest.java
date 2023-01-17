package com.cryptshare.planningpoker.api.extension.aha;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AhaController.class, properties = { "planning-poker.extension.aha.account-domain=example",
		"planning-poker.extension.aha.client-id=abc", "planning-poker.extension.aha.redirect-uri=https://example.com",
		"planning-poker.extension.aha.score-fact-names=Fact Name 1,Fact Name 2" })
@ActiveProfiles("extension:aha")
class AhaControllerTest {

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/extensions/aha/config` returns config")
	@WithMockUser
	void getConfig() throws Exception {
		mockMvc.perform(get("/api/extensions/aha/config"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accountDomain").value("example"))
				.andExpect(jsonPath("$.clientId").value("abc"))
				.andExpect(jsonPath("$.redirectUri").value("https://example.com"))
				.andExpect(jsonPath("$.scoreFactNames.length()").value("2"))
				.andExpect(jsonPath("$.scoreFactNames[0]").value("Fact Name 1"))
				.andExpect(jsonPath("$.scoreFactNames[1]").value("Fact Name 2"));
	}
}