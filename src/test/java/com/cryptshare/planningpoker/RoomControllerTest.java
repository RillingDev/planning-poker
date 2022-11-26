package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.CardSet;
import com.cryptshare.planningpoker.entities.CardSetRepository;
import com.cryptshare.planningpoker.entities.Room;
import com.cryptshare.planningpoker.entities.RoomRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = CardSetController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class RoomControllerTest {

	@MockBean
	RoomRepository roomRepository;

	@MockBean
	CardSetRepository cardSetRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	void getReturnsRooms() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Room room1 = new Room("Room #1", cardSet);
		final Room room2 = new Room("Room #2", cardSet);
		given(roomRepository.findAll()).willReturn(List.of(room1, room2));

		mockMvc.perform(get("/api/rooms"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("Room #1"))
				.andExpect(jsonPath("$[0].cardSetName").value("My Set 1"))
				.andExpect(jsonPath("$[1].name").value("Room #2"))
				.andExpect(jsonPath("$[1].cardSetName").value("My Set 1"));
	}
}
