package com.cryptshare.planningpoker.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UserController.class)
class UserControllerIT {
	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/identity` returns identity")
	@WithMockUser("John Doe")
	void loadIdentity() throws Exception {
		mockMvc.perform(get("/api/identity")).andExpect(status().isOk()).andExpect(jsonPath("$.username").value("John Doe"));
	}
}