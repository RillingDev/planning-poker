package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomExtensionController.class)
class RoomExtensionControllerTest {
	@MockBean
	RoomRepository roomRepository;

	@MockBean
	ExtensionRepository extensionRepository;

	@Autowired
	MockMvc mockMvc;

	private Extension someExtension;

	@BeforeEach
	void setUp() {
		someExtension = new Extension("someExtension");
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/extensions/{extension-key}` throws for unknown extension")
	@WithMockUser("John Doe")
	void enableChecksExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey("bar")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/extensions/{extension-key}` adds extension")
	@WithMockUser("John Doe")
	void addExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey(someExtension.getKey())).willReturn(Optional.of(someExtension));

		mockMvc.perform(post("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getExtensionConfigs()).hasSize(1);
		final RoomExtensionConfig roomExtensionConfig = captor.getValue().getExtensionConfigs().iterator().next();
		assertThat(roomExtensionConfig.getExtension()).isEqualTo(someExtension);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/extensions/{extension-key}` ignores already added extension")
	@WithMockUser("John Doe")
	void addDuplicateExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey(someExtension.getKey())).willReturn(Optional.of(someExtension));

		mockMvc.perform(post("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(room);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/extensions/{extension-key}` throws for unknown extension")
	@WithMockUser("John Doe")
	void removeChecksExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey("bar")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/extensions/{extension-key}` removes extension")
	@WithMockUser("John Doe")
	void removeExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey(someExtension.getKey())).willReturn(Optional.of(someExtension));

		mockMvc.perform(delete("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getExtensionConfigs()).isEmpty();
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/extensions/{extension-key}` ignores already removed extension")
	@WithMockUser("John Doe")
	void removeDuplicateExtension() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKey(someExtension.getKey())).willReturn(Optional.of(someExtension));

		mockMvc.perform(delete("/api/rooms/my-room/extensions/someExtension").with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(room);
	}

}