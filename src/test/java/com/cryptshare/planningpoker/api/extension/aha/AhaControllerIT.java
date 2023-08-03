package com.cryptshare.planningpoker.api.extension.aha;

import com.cryptshare.planningpoker.data.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static com.cryptshare.planningpoker.api.MockOidcLogins.bobOidcLogin;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AhaController.class, properties = {"planning-poker.extension.aha.account-domain=example",
		"planning-poker.extension.aha.client-id=abc", "planning-poker.extension.aha.redirect-uri=https://example.com"})
@ActiveProfiles("extension:aha")
class AhaControllerIT {

	@Autowired
	MockMvc mockMvc;

	@MockBean
	RoomRepository roomRepository;

	@Test
	@DisplayName("GET `/api/extensions/aha` returns config")
	void getConfig() throws Exception {
		mockMvc.perform(get("/api/extensions/aha").with(bobOidcLogin()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accountDomain").value("example"))
				.andExpect(jsonPath("$.clientId").value("abc"))
				.andExpect(jsonPath("$.redirectUri").value("https://example.com"));
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/extensions/aha` throws if room not found")
	void getRoomConfigUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/extensions/aha").with(bobOidcLogin())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/extensions/aha` throws if room has extension not active")
	void getRoomConfigNotActive() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Bob"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/extensions/aha").with(bobOidcLogin())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/extensions/aha` throws if not a member")
	void getRoomConfigNotMember() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Alice"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/extensions/aha").with(bobOidcLogin())).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/extensions/aha` returns config")
	void getRoomConfigReturns() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Bob"));
		final RoomExtensionConfig roomExtensionConfig = new RoomExtensionConfig(new Extension("aha"));
		roomExtensionConfig.getAttributes().put("scoreFactName", "Effort");
		room.getExtensionConfigs().add(roomExtensionConfig);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/extensions/aha").with(bobOidcLogin()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.scoreFactName").value("Effort"));
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/extensions/aha` throws if room not found")
	void editRoomConfigUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room/extensions/aha").with(bobOidcLogin()).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/extensions/aha` throws if room has extension not active")
	void editRoomConfigNotActive() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Bob"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/extensions/aha").with(bobOidcLogin()).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/extensions/aha` throws if not a member")
	void editRoomConfigNotMember() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Alice"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/extensions/aha").with(bobOidcLogin()).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/extensions/aha` updates config")
	void editRoomConfigReturns() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Bob"));
		final RoomExtensionConfig roomExtensionConfig = new RoomExtensionConfig(new Extension("aha"));
		roomExtensionConfig.getAttributes().put("scoreFactName", "Effort");
		room.getExtensionConfigs().add(roomExtensionConfig);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/extensions/aha").with(bobOidcLogin()).with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"scoreFactName\": \"Impact\"}")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final RoomExtensionConfig actual = captor.getValue().getExtensionConfigs().iterator().next();
		assertThat(actual.getAttributes()).containsEntry("scoreFactName", "Impact");
	}
}