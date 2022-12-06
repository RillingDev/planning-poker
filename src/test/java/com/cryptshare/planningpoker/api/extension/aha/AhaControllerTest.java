package com.cryptshare.planningpoker.api.extension.aha;

import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.Set;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AhaController.class)
@ActiveProfiles("extension:aha")
class AhaControllerTest {

	@MockBean
	AhaService ahaService;

	@MockBean
	RoomRepository roomRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/extensions/aha/score-facts` returns score facts")
	@WithMockUser
	void getScoreFactNames() throws Exception {
		given(ahaService.getScoreFactNames()).willReturn(Set.of("Fact Name 1", "Fact Name 2"));

		mockMvc.perform(get("/api/extensions/aha/score-facts"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0]").value("Fact Name 1"))
				.andExpect(jsonPath("$[1]").value("Fact Name 2"));
	}

	@Test
	@DisplayName("POST `/api/extensions/aha/score/` throws on room not found")
	@WithMockUser
	void putIdeaScoreRoomNotFound() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());
		given(ahaService.getScoreFactNames()).willReturn(Set.of("fact1"));

		mockMvc.perform(post("/api/extensions/aha/score/").with(csrf())
				.queryParam("room-name", "my-room")
				.queryParam("score-fact-name", "fact1")
				.queryParam("score-value", "1")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/extensions/aha/score/` throws on not in facts")
	@WithMockUser
	void putIdeaScoreInvalidFactName() throws Exception {
		final Room room = new Room("Room", new CardSet("Card Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));
		given(ahaService.getScoreFactNames()).willReturn(Set.of("fact1"));

		mockMvc.perform(post("/api/extensions/aha/score/").with(csrf())
				.queryParam("room-name", "my-room")
				.queryParam("score-fact-name", "fact2")
				.queryParam("score-value", "1")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/extensions/aha/score/` puts")
	@WithMockUser
	void putIdeaScorePuts() throws Exception {
		final Room room = new Room("Room", new CardSet("Card Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));
		given(ahaService.getScoreFactNames()).willReturn(Set.of("fact1"));

		mockMvc.perform(post("/api/extensions/aha/score/").with(csrf())
				.queryParam("room-name", "my-room")
				.queryParam("score-fact-name", "fact1")
				.queryParam("score-value", "1")).andExpect(status().isOk());
	}
}